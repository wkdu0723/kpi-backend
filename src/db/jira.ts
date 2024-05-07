// import mysql from "mysql";
import sqlite3 from "sqlite3";
import { JiraProjectDBData, JiraProjectLinksDBData } from "../defines/JiraDb";
import { JiraIssueLinkData } from "../defines/JiraWebhook";

// 연결 풀 설정
// const pool = mysql.createPool({
//     host: "toonation-dev2.ctcsrsvpq9nu.ap-northeast-2.rds.amazonaws.com",
//     user: "root",
//     password: "xhdzmsdkdl_toothlife",
//     database: "toonation_kpi",
//     charset: "utf8mb4",
//     port: 3307
// });

// 데이터베이스 파일 이름 지정
const dbFileName = "toonation_kpi.db";

let db: sqlite3.Database;

/** 데이터베이스를 연결합니다. */
export const openDataBase = () => {
    db = new sqlite3.Database(dbFileName, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) {
            console.error("데이터베이스 연결 오류:", err);
        } else {
            console.log("데이터베이스 연결 성공");
        }
    });
}

/** 데이터베이스 연결을 종료합니다. */
export const closeDataBase = () => {
    if (!db) return;
    db.close();
}

/** 해당 계정이 가지고 있는 모든 지라 프로젝트 db에 저장합니다. (초기 설정하기 위함.) */
export const getAccountProject = async () => {

}

/** jira_main 테이블에 있는 모든 데이터를 가지고옵니다. */
export const getJiraProject = async (): Promise<JiraProjectDBData[]> => {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM jira_main", (err, results: JiraProjectDBData[]) => {
            if (err) {
                console.error('쿼리 실행 오류:', err);
                reject([]);
            } else {
                console.log('쿼리 결과:', results);
                resolve(results);
            }
        });
    });
};

/** 프론트팀이 담당자로 되어있는 지라 프로젝트를 생성합니다. */
export const setJiraProject = async (data: JiraProjectDBData): Promise<void> => {
    const { id, project_key, project_name, project_type, created, updated, description, summary, assignee_account_id, assignee_display_name,
        status_name, status_category_id, status_category_name, status_category_color } = data;

    const query = `
        INSERT INTO jira_main (
            id, project_key, project_name, project_type, created, updated,
            description, summary, assignee_account_id, assignee_display_name,
            status_name, status_category_id, status_category_name, status_category_color
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    ];

    db.run(query, values, (err) => {
        if (err) {
            console.error("setJiraProject 쿼리 실행 오류:", err);
        } else {
            console.log("setJiraProject 성공");
        }
    });
}

/** 지라 프로젝트에 연결된 링크들을 저장합니다. */
export const setJiraProjectLinks = async (data: JiraProjectLinksDBData[]): Promise<void> => {
    const query = `
        INSERT OR REPLACE INTO jira_links (
            id, link_project_id, link_project_key, link_project_account_id, link_project_account_name
        )
        VALUES (?, ?, ?, ?, ?);
    `;

    const stmt = db.prepare(query);

    // 트랜잭션 시작
    db.exec('BEGIN TRANSACTION');

    try {
        data.forEach((item) => {
            // 준비된 문에 값 바인딩 및 실행
            stmt.run(item.id, item.link_project_id, item.link_project_key, item.link_project_account_id, item.link_project_account_name);
        });

        // 트랜잭션 커밋
        db.exec('COMMIT');
        console.log('setJiraProjectLinks 완료');
    } catch (err) {
        // 오류 발생 시 트랜잭션 롤백
        db.exec('ROLLBACK');
        console.error('setJiraProjectLinks 오류:', err);
    } finally {
        // 모든 준비된 문을 마무리하여 리소스 해제
        stmt.finalize();
    }
};

/** 이슈 연결 */
export const setJiraProjectLink = async (issueLinkData: JiraIssueLinkData) => {
    const query = `
        INSERT OR REPLACE INTO jira_links (
            link_project_id, id
        )
        VALUES (?, ?);
    `;

    const values = [
        issueLinkData.sourceIssueId,
        issueLinkData.destinationIssueId,
    ];

    db.run(query, values, (err) => {
        if (err) {
            console.error("setJiraProjectLink 쿼리 실행 오류:", err);
        } else {
            console.log("setJiraProjectLink 성공");
        }
    });
}

/** 연결된 이슈 삭제 */
export const deleteJiraProjectLink = async (issueLinkData: JiraIssueLinkData) => {
    const query = `DELETE FROM jira_links WHERE id = ${issueLinkData.destinationIssueId} AND link_project_id = ${issueLinkData.sourceIssueId}`;

    db.run(query, (err) => {
        if (err) {
            console.error("deleteJiraProjectLink 쿼리 실행 오류:", err);
        } else {
            console.log("deleteJiraProjectLink 성공");
        }
    });
}