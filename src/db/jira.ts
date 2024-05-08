import sqlite3 from "sqlite3";
import { JiraProjectDBData, JiraProjectLinksDBData } from "../defines/JiraDb";
import { JiraIssueData, JiraIssueLinkData } from "../defines/JiraWebhook";
import { requestAccountProject } from "../api";
import { projectDataMigration } from "./handler";

// 데이터베이스 파일 이름 지정
const dbFileName = "toonation_kpi.db";

let db: sqlite3.Database;

/** 데이터베이스를 연결합니다. */
export const openDataBase = async () => {
    try {
        db = new sqlite3.Database(dbFileName, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
        console.log("데이터베이스 연결 성공");
        return db;
    } catch (err) {
        console.error("데이터베이스 연결 오류:", err);
        return err;
    }
}

/** 데이터베이스 연결을 종료합니다. */
export const closeDataBase = async () => {
    if (!db) return;
    db.close();
}

/** 지라 이슈 및 이슈 링크들을 db에 저장합니다. */
export const setJiraIntegratedIssue = async (project: JiraIssueData[]) => {
    try {
        // 트랜잭션 시작
        db.exec("BEGIN TRANSACTION");

        for (const item of project) {
            const linksData: JiraProjectLinksDBData[] = [];
            const { id, fields } = item;
            const { issuelinks } = fields;

            const projectData = projectDataMigration(item);

            // 이슈 데이터 삽입
            await setJiraIssue(projectData.issueData);

            // 관련 이슈 링크 데이터 수집
            if (issuelinks) {
                for (const link of issuelinks) {
                    linksData.push({
                        inward_issue_id: link.inwardIssue?.id ?? id,
                        outward_issue_id: link.outwardIssue?.id ?? id,
                    });
                }
            }

            // 이슈 링크 데이터 삽입
            if (linksData.length > 0) await setJiraIssueLinks(linksData);
        }

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

    db.run(query, values, (err) => {
        if (err) {
            console.error("setJiraIssue 쿼리 실행 오류:", err);
        } else {
            console.log("setJiraIssue 성공");
        }
    });
}

/** 이슈를 삭제합니다. */
export const deleteIssue = async (id: string) => {
    const mainQuery = `DELETE FROM jira_main WHERE id = ${id}`;
    const linkQuery = `DELETE FROM jira_links WHERE inward_issue_id = ${id} OR outward_issue_id = ${id}`;

    db.run(linkQuery, (err) => {
        if (err) {
            console.error("deleteIssue link 쿼리 실행 오류:", err);
        } else {
            console.log("deleteIssue link 성공");
        }
    })

    db.run(mainQuery, (err) => {
        if (err) {
            console.error("deleteIssue main 쿼리 실행 오류:", err);
        } else {
            console.log("deleteIssue main 성공");
        }
    });
}

/** 지라 이슈에 연결된 링크들을 저장합니다. */
export const setJiraIssueLinks = async (data: JiraProjectLinksDBData[]): Promise<void> => {
    const checkQuery = `
        SELECT COUNT(*) AS count
        FROM jira_links
        WHERE inward_issue_id = ? AND outward_issue_id = ?;
    `;

    const insertQuery = `
        INSERT INTO jira_links (inward_issue_id, outward_issue_id)
        VALUES (?, ?);
    `;

    try {
        data.forEach(async (item) => {
            const insertValues = [
                item.inward_issue_id,
                item.outward_issue_id
            ];
            // 중복을 확인합니다.
            db.all(checkQuery, [item.inward_issue_id, item.outward_issue_id], (error: Error, result: [{ count: number }]) => {
                const count = result.length > 0 ? result[0].count : 0;
                if (error) console.error("setJiraIssueLinks select 조회 실패", error);
                else if (count === 0) db.run(insertQuery, insertValues);
            });
        });

        console.log("setJiraIssueLinks 완료");
    } catch (err) {
        console.error("setJiraIssueLinks 오류:", err);
    }
};

/** 이슈 링크 단일 연결 */
export const setJiraIssueLink = async (issueLinkData: JiraIssueLinkData) => {
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

    db.run(query, values, (err) => {
        if (err) {
            console.error("setJiraIssueLink 쿼리 실행 오류:", err);
        } else {
            console.log("setJiraIssueLink 성공");
        }
    });
}

/** 연결된 이슈 링크 삭제 */
export const deleteJiraIssueLink = async (issueLinkData: JiraIssueLinkData) => {
    const query = `DELETE FROM jira_links WHERE inward_issue_id = ${issueLinkData.sourceIssueId} AND outward_issue_id = ${issueLinkData.destinationIssueId}`;

    db.run(query, (err) => {
        if (err) {
            console.error("deleteJiraIssueLink 쿼리 실행 오류:", err);
        } else {
            console.log("deleteJiraIssueLink 성공");
        }
    });
}