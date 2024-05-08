import axios from "axios";
import { JiraIssueData } from "../defines/JiraWebhook";

/**
 * 다른 사이트 api를 호출하는 함수들을 작성하는 파일입니다.
 */



/**
 * 지라 api를 이용하여 현재 해당 유저가 가지고있는 게시글을 가지고옵니다. (최신 100개)
 * TODO:: 투네이션 지라 url로 변경해야함.
 * api 토큰필요 (https://id.atlassian.com/manage-profile/security/api-tokens)
 * @param accountId: user accountId값
 * @param email: user email값
 * @param accountAPIKey: api 토큰값 (발급받아야함)
 * */
export const requestAccountProject = async (accountId: string, email: string, accountAPIKey: string): Promise<JiraIssueData[]> => {
    try {
        const jiraUrl = `https://wkdu0723.atlassian.net/rest/api/3/search?jql=assignee=${accountId}&maxResults=100`;
        const authToken = accountAPIKey;
        const authHeader = `Basic ${Buffer.from(`${email}:${authToken}`).toString("base64")}`;

        const config = {
            headers: {
                "Authorization": authHeader,
                "Accept": "application/json",
            },
        };

        const response = await axios.get(jiraUrl, config);
        const issues = response.data.issues as JiraIssueData[];
        return issues;
    } catch (error) {
        console.error("Error fetching issues:", error);
        return [];
    }
}