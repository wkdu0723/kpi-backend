/** Webhook 에서 들어온 데이터를 DB 테이블에 맞게 데이터를 마이그레이션 합니다 */
import {
    IssuelinksData, JiraIssueData, JiraIssueLinkData, JiraWebhookData,
    JiraWebhookEvent, JiraWorkLogData
} from "../defines/JiraWebhook";
import { JiraProjectDBData } from "../defines/JiraDb";
import {
    deleteIssue, deleteJiraIssueLink, deleteJiraWorkLog,
    getUserAllIssues,
    setAccount, setJiraIntegratedIssue, setJiraIssueLink, setJiraWorkLog
} from "./jira";
import { requestAccountProject } from "../api/jira";

export interface ProjectDataMigrationResult {
    issueData: JiraProjectDBData; // Jira 프로젝트 DB 데이터 타입
    linkData: IssuelinksData[]; // Jira 프로젝트 링크 DB 데이터 배열 타입
}

/** 지라 웹훅 이벤트중 필요없는 이벤트 목록입니다. */
const ignoreWebhookEvent = [JiraWebhookEvent.comment_created, JiraWebhookEvent.comment_updated, JiraWebhookEvent.comment_deleted];

/** 지라 프로젝트에 맞는 데이터만 분리하여 쿼리를 실행합니다. */
export const jiraDataMigration = async (webhookData: JiraWebhookData) => {
    try {
        const eventType = webhookData.webhookEvent;
        console.log("????? webhookData:", webhookData);
        if (ignoreWebhookEvent.includes(eventType)) return;

        if (eventType === JiraWebhookEvent.issuelink_created && webhookData.issueLink) await setJiraIssueLink(webhookData.issueLink);
        else if (eventType === JiraWebhookEvent.issuelink_deleted && webhookData.issueLink) await deleteJiraIssueLink(webhookData.issueLink);
        else if (eventType === JiraWebhookEvent.issue_deleted && webhookData.issue) await deleteIssue(webhookData.issue.id);
        else if (eventType === JiraWebhookEvent.worklog_created || eventType === JiraWebhookEvent.worklog_updated || eventType === JiraWebhookEvent.worklog_deleted)
            await jiraWorkLogHandler(eventType, webhookData.worklog);
        else if (webhookData.issue) await setJiraIntegratedIssue([webhookData.issue]);
    } catch (err) {
        console.error("jiraDataMigration:", err);
    }
}

/** 메인 이슈 db테이블에 맞게 데이터를 마이그레이션합니다. */
export const projectDataMigration = (issueData: JiraIssueData): ProjectDataMigrationResult => {
    const { id, key: issue_key, fields } = issueData;
    const { project, created, updated, description, summary, status, assignee, creator, issuelinks, parent, customfield_10015: start_date } = fields;
    const { name: project_name, projectTypeKey: project_type, key: project_key } = project;
    const { name: status_name, statusCategory } = status;
    const { id: status_category_id, name: status_category_name, colorName: status_category_color } = statusCategory;
    const assignee_account_id = assignee?.accountId ? assignee.accountId : creator.accountId;
    const assignee_display_name = assignee?.displayName ? assignee.displayName : creator.displayName;
    const parent_id = parent ? parent.id : undefined;
    const parent_key = parent ? parent.key : undefined;

    const data = {
        id, issue_key, project_key, project_name, project_type, created, updated, description, summary,
        assignee_account_id, assignee_display_name, status_name, status_category_id,
        status_category_name, status_category_color, parent_id, parent_key, start_date,
    }

    return {
        issueData: data,
        linkData: issuelinks ? issuelinks : []
    };
}

// /** 지라 이슈를 생성 및 업데이트합니다. */
// const updateJiraIssueHandler = async (issueData?: JiraIssueData) => {
//     try {
//         if (!issueData) return;
//         await setJiraIntegratedIssue([issueData])
//     } catch (err) {
//         console.error("updateJiraIssueHandler:", err);
//     }
// }

// /** 이슈를 삭제합니다. */
// const deleteJiraIssue = async (issueData?: JiraIssueData) => {
//     try {
//         if (!issueData) return;
//         await deleteIssue(issueData.id);
//     } catch (err) {
//         console.error("deleteJiraIssue:", err);
//     }
// }

// /** 이슈를 연결합니다. */
// const setJiraIssueLinkHandler = async (issueLinkData?: JiraIssueLinkData) => {
//     try {
//         if (!issueLinkData) return;
//         await setJiraIssueLink(issueLinkData);
//     } catch (err) {
//         console.error("setJiraIssueLinkHandler:", err);
//     }
// }

// /** 연결된 지라 이슈를 삭제합니다. */
// const deleteJiraIssueLinkHandler = async (issueLinkData?: JiraIssueLinkData) => {
//     try {
//         if (!issueLinkData) return;
//         await deleteJiraIssueLink(issueLinkData);
//     } catch (err) {
//         console.error("deleteJiraIssueLinkHandler:", err);
//     }
// }

/** 유저가 작성한 최신 게시글 100개를 가져와 db에 저장하기 위한 핸들러입니다. (초기 데이터 설정을 위함) */
export const setAccountProjectHandler = async (accountId: string, email: string, accountAPIKey: string) => {
    try {
        const resp = await requestAccountProject(accountId, email, accountAPIKey);

        if (resp.length <= 0) return;

        await setJiraIntegratedIssue(resp);
    } catch (err) {
        console.error("setAccountProjectHandler:", err);
    }
}

/** 유저 계정 정보를 db에 저장하기 위한 핸들러입니다. */
export const setJiraAccountHandler = async (accountId: string, name: string, email: string, accountAPIKey: string) => {
    try {
        await setAccount(accountId, name, email, accountAPIKey);
    } catch (err) {
        console.error("setAccountProjectHandler:", err);
    }
}

/** 작업 내역 정보를 db에 저장하기 위한 핸들러입니다. */
export const jiraWorkLogHandler = async (eventType: JiraWebhookEvent, workLog?: JiraWorkLogData) => {
    try {
        if (!workLog) return;

        if (eventType === JiraWebhookEvent.worklog_deleted) await deleteJiraWorkLog(workLog.id);
        else await setJiraWorkLog(workLog);

    } catch (err) {
        console.error("setJiraWorkLogHandler:", err)
    }
}


/** 유저의 모든 지라 이슈데이터를 가져오기 위한 핸들러입니다. */
export const getUserIssuesHandler = async (accountId: string) => {
    try {
        if (!accountId) return [];
        const issues = await getUserAllIssues(accountId);

        return issues;
    } catch (err) {
        console.error("getUserIssuesHandler:", err);
        return [];
    }
}