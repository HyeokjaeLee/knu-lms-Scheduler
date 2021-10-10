import React from "react";
import { ReactComponent as Logo } from "../assets/img/logo.svg";
import { ReactComponent as Done } from "../assets/img/done.svg";
import { ReactComponent as Todo } from "../assets/img/todo.svg";
import { ReactComponent as Late } from "../assets/img/late.svg";
import { ReactComponent as ShortCut } from "../assets/img/shortcut.svg";
import Footer from "../components/footer";
function Contents(props) {
  const today = new Date().getTime();
  const [subjectList, setSubjectList] = React.useState(<></>);
  const [navTxt, setNavTxt] = React.useState("Detail");
  const [detail, setDetail] = React.useState(<></>);
  const update_subject = () => {
    window.api.send("update-subject");
  };

  const set_subjects = () => {
    window.api.send("set-target-subject");
  };

  window.api.receive("update-start", () => {
    setNavTxt(
      <div className="loading-wrap">
        <label>과목 정보를 불러오는 중입니다...</label>
        <div className="loading-object"></div>
      </div>
    );
  });
  window.api.receive("update-finish", () => {
    setNavTxt("Detail");
  });

  window.api.receive("set-subject-data", (subjectData) => {
    console.log("subject update");
    const subjectElementArr = subjectData.map((subject, index) => {
      const todoList = subject.data.filter((_data) => !_data.done && !_data.fail);
      const todoCount = todoList.length;
      let deadline = "";
      let lecture = "";
      let task = <Done className="all-done" />;
      let highLight = "";
      if (todoCount > 0) {
        const deadlineList = todoList.map((_data) => _data.deadline);
        const nearDeadline = Math.min(...deadlineList);
        const taskCount = todoList.filter((_data) => _data.type === "과제").length;
        const leftDeadline = Math.floor((nearDeadline - today) / 100 / 60 / 60 / 24) / 10;
        task = `미제출 ${taskCount}개`;
        lecture = `미수강 ${todoCount - taskCount}개`;
        deadline = `마감 ${leftDeadline}일`;
        highLight = leftDeadline < 5 ? "red" : "";
      }

      const link2LMS = () => {
        window.api.send("open-lms-page", subject.url);
      };

      const viewDetail = () => {
        const detailItem = subject.data.map((_data) => {
          const result = _data.done ? (
            <Done class="done" />
          ) : _data.fail ? (
            <Late class="fail" />
          ) : (
            <Todo class="todo" />
          );
          const deadline = new Date(_data.deadline);
          const deadlineTxt = `${
            deadline.getMonth() + 1
          }월 ${deadline.getDate()}일 ${deadline.getHours()}:${deadline.getMinutes()}까지`;
          return (
            <article className="subject-detail-item">
              <section className="subject-info-wrap">
                <div className="type">{_data.type}</div>
                <h2 className="name">{_data.name}</h2>
                <div className="deadline">{deadlineTxt}</div>
              </section>
              {result}
            </article>
          );
        });
        setDetail(detailItem);
      };
      index === 0 && viewDetail();
      return (
        <li className="subject-wrap" onClick={viewDetail}>
          <div className="subject-header">
            <a onClick={link2LMS} className={`shortcut ${highLight}`}>
              <ShortCut class="shortcut-icon" />
            </a>
            <h2 className="subject-title">{subject.title}</h2>
          </div>
          <div className="subject-item-wrap">
            <span className="lecture">{lecture}</span>
            <span className="task">{task}</span>
            <span className="deadline">{deadline}</span>
          </div>
        </li>
      );
    });
    setSubjectList(subjectElementArr);
  });

  return (
    <section className="contents-section">
      <nav>
        <div className="logo-wrap">
          <Logo class="nav-logo" />
          <h1>SCHEDULER</h1>
        </div>
        <div className="nav-txt">{navTxt}</div>
        <button className="edit-button" onClick={set_subjects}>
          과목 편집
        </button>
        <button className="refresh-button" onClick={update_subject}>
          새로고침
        </button>
      </nav>
      <main>
        <ul className="subject-list">{subjectList}</ul>
        <section className="contents">
          {detail}
          <Footer />
        </section>
      </main>
    </section>
  );
}

export default Contents;