import sqlite3 from "sqlite3";
import { JiraProjectDBData, JiraProjectLinksDBData, MergeJiraData } from "../defines/JiraDb";
import { JiraIssueData, JiraIssueLinkData, JiraWorkLogData } from "../defines/JiraWebhook";
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

/** 트랜잭션 시작 */
const beginTransaction = async () => {
    return new Promise((resolve, reject) => {
        db.exec("BEGIN TRANSACTION", (err) => {
            if (err) reject(err);
            else resolve(null);
        });
    });
}

/** 트랜잭션 커밋 */
const commitTransaction = async () => {
    return new Promise((resolve, reject) => {
        db.exec("COMMIT", (err) => {
            if (err) reject(err);
            else resolve(null);
        });
    });
}

/** 트랜잭션 롤백 */
const rollbackTransaction = async () => {
    return new Promise((resolve, reject) => {
        db.exec("ROLLBACK", (err) => {
            if (err) reject(err);
            else resolve(null);
        });
    });
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
        await beginTransaction();
        const linksData: JiraProjectLinksDBData[] = [];

        for (const item of project) {
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
        await commitTransaction();
        console.log("setJiraIntegratedIssue 완료");
    } catch (err) {
        // // 오류 발생 시 트랜잭션 롤백
        await rollbackTransaction();
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
        const { id, issue_key, project_key, project_name, project_type, created, updated, description, summary, assignee_account_id, assignee_display_name,
            status_name, status_category_id, status_category_name, status_category_color, parent_id, parent_key, start_date } = data;

        const query = `
            INSERT INTO jira_main (
                id, issue_key, project_key, project_name, project_type, created, updated,
                description, summary, assignee_account_id, assignee_display_name,
                status_name, status_category_id, status_category_name, status_category_color, parent_id, parent_key, start_date
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                issue_key=excluded.issue_key,
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
                status_category_color=excluded.status_category_color,
                parent_id=excluded.parent_id,
                parent_key=excluded.parent_key,
                start_date=excluded.start_date;
            `;

        const values = [
            id,
            issue_key,
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
            parent_id,
            parent_key,
            start_date,
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

/** 작업내역을 생성 및 업데이트합니다. */
export const setJiraWorkLog = async (workLog: JiraWorkLogData) => {
    try {
        const { id, author, comment, created, updated, started, timeSpentSeconds, issueId } = workLog;

        const query = `
            INSERT INTO jira_worklog (
                id, user_id, user_name, issue_id, comment, created, updated,
                started, time_spent_seconds
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                user_id=excluded.user_id,
                user_name=excluded.user_name,
                issue_id=excluded.issue_id,
                comment=excluded.comment,
                created=excluded.created,
                updated=excluded.updated,
                started=excluded.started,
                time_spent_seconds=excluded.time_spent_seconds;
            `;

        const values = [
            id,
            author.accountId,
            author.displayName,
            issueId,
            comment,
            created,
            updated,
            started,
            timeSpentSeconds
        ];

        await new Promise((resolve, reject) => {
            db.run(query, values, (err) => {
                if (err) reject(err);
                else resolve("");
            });
        });
    } catch (err) {
        console.error("setJiraWorkLog 쿼리 실행 오류:", err);
    }
}

/** 작업 내역을 삭제합니다. */
export const deleteJiraWorkLog = async (id: string) => {
    try {
        const query = `DELETE FROM jira_worklog WHERE id = ${id}`;

        await new Promise((resolve, reject) => {
            db.run(query, (err) => {
                if (err) reject(err);
                else resolve("");
            });
        });
    } catch (err) {
        console.error("deleteJiraWorkLog 쿼리 실행 오류:", err);
    }
}

/** 유저의 지라 이슈데이터를 가지고옵니다. */
export const getUserAllIssues = async (name: string): Promise<JiraProjectDBData[]> => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM jira_main WHERE assignee_account_id='${name}';`, (err, results: JiraProjectDBData[]) => {
            if (err) {
                console.error("getUserAllIssues 쿼리 실행 오류:", err);
                reject([]);
            } else {
                resolve(results);
            }
        });
    });
}

/** 검색결과에 맞는 데이터를 가지고옵니다. */
export const getSearchData = async (filter: string, keyword: string, rowsPerPage: number): Promise<MergeJiraData> => {
    const notParent = 'parent_id IS NULL';
    const contition = filter ? `WHERE ${filter} like '%${keyword}%' AND ${notParent} LIMIT ${rowsPerPage}` : `WHERE ${notParent} LIMIT ${rowsPerPage}`;
    const query = `SELECT * FROM jira_main ${contition};`;

    return new Promise((resolve, reject) => {
        db.all(query, (err, parentRows: JiraProjectDBData[]) => {
            if (err) {
                console.error("getSearchData 쿼리 실행 오류:", err);
                reject({ parents: [], children: [] });
            } else {
                const parentIds = parentRows.map(row => row.id);

                if (parentIds.length === 0) {
                    resolve({ parents: parentRows, children: [] });
                    return;
                }

                const placeholders = parentIds.map(() => "?").join(",");
                const childQuery = `SELECT * FROM jira_main WHERE parent_id IN (${placeholders})`;

                db.all(childQuery, parentIds, (err, childRows: JiraProjectDBData[]) => {
                    if (err) {
                        reject({ parents: [], children: [] });
                    } else {
                        resolve({ parents: parentRows, children: childRows });
                    }
                });
            }
        });
    });
}

/** 해당 지라프로젝트에 작업로그중 아이디와 총 작업 시간값을 가지고옵니다. */
export const getWorkTimeGroupByUser = async (issue_id: string) => {
    const query = `SELECT issue_id, sum(time_spent_seconds) as totalTime, user_id, user_name FROM jira_worklog WHERE issue_id='${issue_id}' group by user_id;`

    return new Promise((resolve, reject) => {
        db.all(query, (err, results: JiraProjectDBData[]) => {
            if (err) {
                console.error("getWorkTimeGroupByUser 쿼리 실행 오류:", err);
                reject([]);
            } else {
                resolve(results);
            }
        });
    });
}