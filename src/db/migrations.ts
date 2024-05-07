/** Webhook 에서 들어온 데이터를 DB 테이블에 맞게 데이터를 마이그레이션 합니다 */
import { JiraIssueData, JiraIssueLinkData, JiraWebhookData, JiraWebhookEvent } from "../defines/JiraWebhook";
import { JiraProjectDBData, JiraProjectLinksDBData } from "../defines/JiraDb";
import { closeDataBase, deleteJiraProjectLink, getJiraProject, openDataBase, setJiraProject, setJiraProjectLink, setJiraProjectLinks } from "./jira";

/** 지라 프로젝트에 맞는 데이터만 분리하여 쿼리를 실행합니다. */
export const jiraDataMigration = async (webhookData: JiraWebhookData) => {
    console.log("???? webhookData:", webhookData);
    const eventType = webhookData.webhookEvent;

    if (eventType === JiraWebhookEvent.issuelink_created) setJiraIssueLink(webhookData.issueLink);
    else if (eventType === JiraWebhookEvent.issuelink_deleted) deleteJiraIssueLink(webhookData.issueLink);
    else updateJiraIssue(webhookData.issue);
}

/** 지라 이슈를 생성 및 업데이트합니다. */
const updateJiraIssue = async (issueData?: JiraIssueData) => {
    if (!issueData) return;

    // const { displayName } = user;
    const { id, key: project_key, fields } = issueData;
    const { project, created, updated, description, summary, status, assignee, creator, issuelinks } = fields;
    const { name: project_name, projectTypeKey: project_type } = project;
    const { name: status_name, statusCategory } = status;
    const { id: status_category_id, name: status_category_name, colorName: status_category_color } = statusCategory;
    const assignee_account_id = assignee?.accountId ? assignee.accountId : creator.accountId;
    const assignee_display_name = assignee?.displayName ? assignee.displayName : creator.displayName;

    const data = {
        id, project_key, project_name, project_type, created, updated, description, summary,
        assignee_account_id, assignee_display_name, status_name, status_category_id,
        status_category_name, status_category_color,
    }

    const linksData: JiraProjectLinksDBData[] = [];
    issuelinks?.map((item) => {
        linksData.push({
            id,
            link_project_id: item.outwardIssue.id,
            link_project_key: item.outwardIssue.key,
            link_project_account_id: assignee_account_id,
            link_project_account_name: assignee_display_name,
        });
    });

    openDataBase();
    await setJiraProject(data);
    if (linksData.length > 0) await setJiraProjectLinks(linksData);
    closeDataBase();
}

/** 이슈를 연결합니다. */
const setJiraIssueLink = async (issueLinkData?: JiraIssueLinkData) => {
    if (!issueLinkData) return;

    openDataBase();
    await setJiraProjectLink(issueLinkData);
    closeDataBase();
}

/** 연결된 지라 이슈를 삭제합니다. */
const deleteJiraIssueLink = async (issueLinkData?: JiraIssueLinkData) => {
    if (!issueLinkData) return;

    openDataBase();
    await deleteJiraProjectLink(issueLinkData);
    closeDataBase();
}