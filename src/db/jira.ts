import sqlite3 from "sqlite3";
import { JiraProjectDBData, JiraProjectLinksDBData } from "../defines/JiraDb";
import { JiraIssueData, JiraIssueLinkData } from "../defines/JiraWebhook";
import { projectDataMigration } from "./handler";

// 데이터베이스 파일 이름 지정
const dbFileName = "toonation_kpi.db";

let db: sqlite3.Database;

/** 데이터베이스를 연결합니다. */
export const openDataBase = async (): Promise<void> => {
    try {
        db = new sqlite3.Database(dbFileName, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
        console.log("데이터베이스 연결 성공");
    } catch (err) {
        console.error("데이터베이스 연결 오류:", err);
    }
}

/** 데이터베이스 연결을 종료합니다. */
export const closeDataBase = async () => {
    try {
        if (!db) return
        db.close();
    } catch (err) {
        console.error("closeDataBase 에러", err);
    }
}

/** 계정을 저장합니다. (이미 id가 존재할 경우 업데이트) */
export const setAccount = async (id: string, name: string, email: string, apiToken: string): Promise<void> => {
    try {
        const query = `
            INSERT INTO jira_users (id, name, email, api_token)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                email = excluded.email,
                api_token = excluded.api_token;
        `;

        const values = [id, name, email, apiToken];

        await new Promise((resolve, reject) => {
            db.run(query, values, (err) => {
                if (err) reject(err);
                else resolve("");
            });
        });
    } catch (err) {
        console.error("setAccount 에러:", err);
    }
}

/** 지라 이슈 및 이슈 링크들을 db에 저장합니다. */
export const setJiraIntegratedIssue = async (project: JiraIssueData[]) => {
    try {
        // 트랜잭션 시작
        db.exec("BEGIN TRANSACTION");
        const linksData: JiraProjectLinksDBData[] = [];
        let test = 0;

        for (const item of project) {
            test += 1;
            const { id, fields } = item;
            const { issuelinks } = fields;

            const projectData = projectDataMigration(item);

            await setJiraIssue(projectData.issueData);

            if (!issuelinks) break;

            for (const link of issuelinks) {
                linksData.push({
                    inward_issue_id: link.inwardIssue?.id ?? id,
                    outward_issue_id: link.outwardIssue?.id ?? id,
                });
            }
        }

        if (linksData.length > 0) await setJiraIssueLinks(linksData);

        // 트랜잭션 커밋
        db.exec("COMMIT");
        console.log("setJiraIntegratedIssue 완료");
    } catch (err) {
        // // 오류 발생 시 트랜잭션 롤백
        db.exec("ROLLBACK");
        console.error("setJiraIntegratedIssue 오류:", err);
    }
}

/** jira_main 테이블에 있는 모든 데이터를 가지고옵니다. */
export const getJiraIssue = async (): Promise<JiraProjectDBData[]> => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM jira_main", (err, results: JiraProjectDBData[]) => {
            if (err) {
                console.error("쿼리 실행 오류:", err);
                reject([]);
            } else {
                console.log("쿼리 결과:", results);
                resolve(results);
            }
        });
    });
};

/** 지라 이슈를 저장합니다. */
export const setJiraIssue = async (data: JiraProjectDBData): Promise<void> => {
    try {
        const { id, project_key, project_name, project_type, created, updated, description, summary, assignee_account_id, assignee_display_name,
            status_name, status_category_id, status_category_name, status_category_color, parent } = data;

        const query = `
            INSERT INTO jira_main (
                id, project_key, project_name, project_type, created, updated,
                description, summary, assignee_account_id, assignee_display_name,
                status_name, status_category_id, status_category_name, status_category_color, parent_id, parent_key
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                project_key=excluded.project_key,
                project_name=excluded.project_name,
                project_type=excluded.project_type,
                created=excluded.created,
                updated=excluded.updated,
                description=excluded.description,
                summary=excluded.summary,
                assignee_account_id=excluded.assignee_account_id,
                assignee_display_name=excluded.assignee_display_name,
                status_name=excluded.status_name,
                status_category_id=excluded.status_category_id,
                status_category_name=excluded.status_category_name,
                status_category_color=excluded.status_category_color;
                parent_id=excluded.parent_id;
                parent_key=excluded.parent_key;
            `;

        const values = [
            id,
            project_key,
            project_name,
            project_type,
            created,
            updated,
            description,
            summary,
            assignee_account_id,
            assignee_display_name,
            status_name,
            status_category_id,
            status_category_name,
            status_category_color,
            parent?.id,
            parent?.key
        ];
        await new Promise((resolve, reject) => {
            db.run(query, values, (err) => {
                if (err) reject(err);
                else resolve("");
            });
        });
    } catch (err) {
        console.error("setJiraIssue 쿼리 에러:", err);
    }
}

/** 이슈를 삭제합니다. */
export const deleteIssue = async (id: string) => {
    try {
        const mainQuery = `DELETE FROM jira_main WHERE id = ?`;
        const linkQuery = `DELETE FROM jira_links WHERE inward_issue_id = ? OR outward_issue_id = ?`;

        await new Promise((resolve, reject) => {
            db.run(linkQuery, [id, id], (err) => {
                if (err) reject(err);

                db.run(mainQuery, [id], (err) => {
                    if (err) reject(err);
                    else resolve("");
                });
            });
        });
    } catch (err) {
        console.error("deleteIssue 실패 :", err);
    }
}

/** 지라 이슈에 연결된 링크들을 저장합니다. */
export const setJiraIssueLinks = async (data: JiraProjectLinksDBData[]): Promise<void> => {
    try {
        // 중복 확인 및 삽입 쿼리
        const checkAndInsertQuery = `
            INSERT INTO jira_links (inward_issue_id, outward_issue_id)
            SELECT ?, ?
            WHERE NOT EXISTS (
                SELECT 1 FROM jira_links
                WHERE inward_issue_id = ? AND outward_issue_id = ?
            );
        `;

        // data 배열의 각 항목에 대해 중복 확인 및 삽입 작업을 수행합니다.
        for (const item of data) {
            const values = [
                item.inward_issue_id,
                item.outward_issue_id,
                item.inward_issue_id,
                item.outward_issue_id
            ];

            // 중복 확인 및 삽입 쿼리 실행
            await new Promise((resolve, reject) => {
                db.run(checkAndInsertQuery, values, (err) => {
                    if (err) reject(err);
                    else resolve("");
                });
            });
        }
    } catch (innerError) {
        console.error("setJiraIssueLinks:", innerError);
    }
};

/** 이슈 링크 단일 연결 */
export const setJiraIssueLink = async (issueLinkData: JiraIssueLinkData) => {
    try {
        const query = `
            INSERT INTO jira_links (
                inward_issue_id, outward_issue_id
            )
            VALUES (?, ?);
        `;

        const values = [
            issueLinkData.sourceIssueId,
            issueLinkData.destinationIssueId,
        ];

        await new Promise((resolve, reject) => {
            db.run(query, values, (err) => {
                if (err) reject(err);
                else resolve("");
            });
        });
    } catch (err) {
        console.error("setJiraIssueLink 쿼리 실행 오류:", err);
    }
}

/** 연결된 이슈 링크 삭제 */
export const deleteJiraIssueLink = async (issueLinkData: JiraIssueLinkData) => {
    try {
        const query = `DELETE FROM jira_links WHERE inward_issue_id = ${issueLinkData.sourceIssueId} AND outward_issue_id = ${issueLinkData.destinationIssueId}`;

        await new Promise((resolve, reject) => {
            db.run(query, (err) => {
                if (err) reject(err);
                else resolve("");
            });
        });
    } catch (err) {
        console.error("deleteJiraIssueLink 쿼리 실행 오류:", err);
    }
}