/** Webhook 에서 들어온 데이터를 DB 테이블에 맞게 데이터를 마이그레이션 합니다 */
import { IssuelinksData, JiraIssueData, JiraIssueLinkData, JiraWebhookData, JiraWebhookEvent } from "../defines/JiraWebhook";
import { JiraProjectDBData, JiraProjectLinksDBData } from "../defines/JiraDb";
import { closeDataBase, deleteIssue, deleteJiraIssueLink, getJiraIssue, openDataBase, setAccount, setJiraIntegratedIssue, setJiraIssueLink } from "./jira";
import { requestAccountProject } from "../api";

export interface ProjectDataMigrationResult {
    issueData: JiraProjectDBData; // Jira 프로젝트 DB 데이터 타입
    linkData: IssuelinksData[]; // Jira 프로젝트 링크 DB 데이터 배열 타입
}

/** 지라 프로젝트에 맞는 데이터만 분리하여 쿼리를 실행합니다. */
export const jiraDataMigration = async (webhookData: JiraWebhookData) => {
    const eventType = webhookData.webhookEvent;
    console.log("????? webhookData:", webhookData);

    if (eventType === JiraWebhookEvent.issuelink_created) await setJiraIssueLinkHandler(webhookData.issueLink);
    else if (eventType === JiraWebhookEvent.issuelink_deleted) await deleteJiraIssueLinkHandler(webhookData.issueLink);
    else if (eventType === JiraWebhookEvent.issue_deleted) await deleteJiraIssue(webhookData.issue);
    else await updateJiraIssueHandler(webhookData.issue);
}

/** 메인 이슈 db테이블에 맞게 데이터를 마이그레이션합니다. */
export const projectDataMigration = (issueData: JiraIssueData): ProjectDataMigrationResult => {
    // const { displayName } = user;
    const { id, key: project_key, fields } = issueData;
    const { project, created, updated, description, summary, status, assignee, creator, issuelinks, parent } = fields;
    const { name: project_name, projectTypeKey: project_type } = project;
    const { name: status_name, statusCategory } = status;
    const { id: status_category_id, name: status_category_name, colorName: status_category_color } = statusCategory;
    const assignee_account_id = assignee?.accountId ? assignee.accountId : creator.accountId;
    const assignee_display_name = assignee?.displayName ? assignee.displayName : creator.displayName;

    const data = {
        id, project_key, project_name, project_type, created, updated, description, summary,
        assignee_account_id, assignee_display_name, status_name, status_category_id,
        status_category_name, status_category_color, parent,
    }

    return {
        issueData: data,
        linkData: issuelinks ? issuelinks : []
    };
}

/** 지라 이슈를 생성 및 업데이트합니다. */
const updateJiraIssueHandler = async (issueData?: JiraIssueData) => {
    try {
        if (!issueData) return;
        await openDataBase();
        await setJiraIntegratedIssue([issueData])
        await closeDataBase();
    } catch (err) {
        console.error("updateJiraIssueHandler", err);
    }
}

/** 이슈를 삭제합니다. */
const deleteJiraIssue = async (issueData?: JiraIssueData) => {
    try {
        if (!issueData) return;
        await openDataBase();
        await deleteIssue(issueData.id);
        await closeDataBase();
    } catch (err) {
        console.error("deleteJiraIssue", err);
    }
}

/** 이슈를 연결합니다. */
const setJiraIssueLinkHandler = async (issueLinkData?: JiraIssueLinkData) => {
    try {
        if (!issueLinkData) return;
        await openDataBase();
        await setJiraIssueLink(issueLinkData);
        await closeDataBase();
    } catch (err) {
        console.error("setJiraIssueLinkHandler", err);
    }
}

/** 연결된 지라 이슈를 삭제합니다. */
const deleteJiraIssueLinkHandler = async (issueLinkData?: JiraIssueLinkData) => {
    try {
        if (!issueLinkData) return;
        await openDataBase();
        await deleteJiraIssueLink(issueLinkData);
        await closeDataBase();
    } catch (err) {
        console.error("deleteJiraIssueLinkHandler", err);
    }
}

/** 유저가 작성한 최신 게시글 100개를 가져와 db에 저장하기 위한 핸들러입니다. (초기 데이터 설정을 위함) */
export const setAccountProjectHandler = async (accountId: string, email: string, accountAPIKey: string) => {
    try {
        const resp = await requestAccountProject(accountId, email, accountAPIKey);

        if (resp.length <= 0) return;

        await openDataBase();
        await setJiraIntegratedIssue(resp);
        await closeDataBase();
    } catch (err) {
        console.error("setAccountProjectHandler", err);
    }
}

/** 유저 계정 정보를 db에 저장하기 위한 핸들러입니다. */
export const setJiraAccountHandler = async (accountId: string, name: string, email: string, accountAPIKey: string) => {
    try {
        await openDataBase();
        await setAccount(accountId, name, email, accountAPIKey);
        await closeDataBase();
    } catch (err) {
        console.error("setAccountProjectHandler", err);
    }
}
