/** Webhook 에서 들어온 데이터를 DB 테이블에 맞게 데이터를 마이그레이션 합니다 */
import { JiraWebhookData } from "../defines/JiraWebhook";
import { JiraProjectDBData, JiraProjectLinksDBData } from "../defines/JiraDb";
import { getJiraProject, setJiraProject, setJiraProjectLinks } from "./jira";

/** 지라 프로젝트에 맞는 데이터만 분리하여 쿼리를 실행합니다. */
export const jiraProjectDataMigration = (webhookData: JiraWebhookData) => {
    const { issue } = webhookData;
    // const { displayName } = user;
    const { id, key: project_key, fields } = issue;
    const { project, created, updated, description, summary, status, assignee, creator, issuelinks } = fields;
    const { name: project_name, projectTypeKey: project_type } = project;
    const { name: status_name, statusCategory } = status;
    const { id: status_category_id, name: status_category_name, colorName: status_category_color } = statusCategory;
    const assignee_account_id = assignee?.accountId ? assignee.accountId : creator.accountId;
    const assignee_display_name = assignee?.displayName ? assignee.displayName : creator.displayName;
    console.log("??????? issuelinks:", issuelinks);

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

    setJiraProject(data);
    if (linksData.length > 0) setJiraProjectLinks(linksData);
}