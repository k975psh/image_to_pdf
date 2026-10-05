# 📄 img2pdf - 이미지 to PDF 변환기 (Web Application)

> **서버 전송 없이 100% 브라우저 내에서만 안전하게 동작하는 클라이언트 기반 Image to PDF 변환 웹 어플리케이션**입니다.  
> GitHub Pages를 통해 별도의 서버 구축 없이 즉시 정적 웹사이트로 배포 및 호스팅할 수 있습니다.

---

## ✨ 주요 기능 및 특징

- 🔒 **100% 프라이버시 보호 (Zero Server Upload)**: 이미지가 외부 서버로 전송되지 않고 사용자의 로컬 브라우저 메모리 안에서만 처리되므로 민감한 문서나 개인 사진도 안심하고 변환할 수 있습니다.
- 🎯 **이미지 맞춤 최적화 페이지 변환 (Auto-Orientation)**:
  - **자동 최적화 (기본값)**: 가로로 긴 이미지는 **A4 가로(Landscape)**, 세로로 긴 이미지는 **A4 세로(Portrait)**로 자동 감지 및 변환하여 불필요한 여백을 최소화합니다.
  - **A4 세로 고정 / A4 가로 고정**: 사용자의 선호에 따라 전체 페이지 방향을 하나로 통일할 수 있습니다.
  - **이미지 원본 비율 1:1 맞춤**: 이미지 고유의 비율을 그대로 유지한 맞춤형 PDF 규격을 생성합니다.
- 📐 **가로세로 비율(Aspect Ratio) 엄격 유지 (Scale-to-Fit)**: 이미지가 왜곡되거나 찌그러지지 않고 원본 비율을 유지하면서 페이지 크기에 딱 맞게 자동 조정 및 중앙 정렬됩니다.
- 🔀 **드래그 앤 드롭 자유 순서 변경**: [Sortable.js](https://github.com/SortableJS/Sortable)를 탑재하여 마우스나 모바일 터치로 썸네일을 끌어서 PDF 페이지 출력 순서를 직관적으로 바꿀 수 있습니다. (페이지 번호 실시간 자동 갱신)
- ⚡ **비동기 처리 & 실시간 진행률 표시**: 고해상도 이미지를 여러 장 추가해도 브라우저가 멈추지 않도록 비동기(`async/await`) 루프로 렌더링하며, 프로그레스 바와 스피너로 진행 상황을 한눈에 확인할 수 있습니다.
- 📏 **여백 조절 옵션**: 여백 없음(0mm), 기본 여백(10mm), 넓은 여백(20mm) 중 원하는 여백을 간편하게 지정할 수 있습니다.
- 💾 **즉시 자동 다운로드**: 변환 완료 시 `converted_images.pdf` 파일로 기기에 즉시 자동 저장됩니다.

---

## 📁 GitHub 업로드 파일 구성 안내

GitHub Pages로 웹 서비스를 운영하기 위해 업로드해야 하는 파일 목록입니다.

### 1. 필수 웹 실행 파일 (반드시 루트 폴더에 위치해야 함)
- **`index.html`**: 웹 서비스의 메인 HTML 구조 및 라이브러리(jsPDF, SortableJS) CDN 연동
- **`style.css`**: 반응형 디자인, 드롭존, 썸네일 그리드, 변환 모달 스타일 시트
- **`script.js`**: 비동기 이미지 로딩, 규격 최적화 계산, 드래그 순서 변경, jsPDF 변환 엔진

### 2. 권장 보조 파일 (저장소 관리 및 안내용)
- **`README.md`**: 프로젝트 소개, 기능 안내 및 배포 매뉴얼 (본 문서)
- **`.gitignore`**: 불필요한 OS 및 에디터 임시 파일이 업로드되지 않도록 방지
- **`LICENSE`**: MIT 라이선스

> 💡 **참고:** 프로젝트 개발 시 사용된 `img2pdf.md`(지시서)와 `agent_guidelines_v2.0_ko.md`는 개발 참고용 문서이므로 GitHub에 올리지 않아도 서비스 동작에 전혀 영향을 주지 않습니다.

---

## 🚀 GitHub Pages 웹 배포 방법 (Step-by-Step)

별도의 백엔드 서버나 빌드 과정 없이, GitHub 저장소에 코드를 올리고 설정 한 번만 켜면 즉시 나만의 변환 사이트가 열립니다.

### 1단계: GitHub 새 저장소(Repository) 생성
1. [GitHub](https://github.com/)에 로그인한 후, 우측 상단의 `+` 아이콘 클릭 ➡ **[New repository]**를 선택합니다.
2. **Repository name**에 원하는 이름(예: `img2pdf`)을 입력합니다.
3. 공개 범위는 **Public**으로 설정하고, 맨 아래 **[Create repository]**를 클릭합니다.

### 2단계: 파일 업로드 (2가지 방법 중 택 1)
- **방법 A: 웹 브라우저에서 직접 드래그 업로드 (가장 간편)**
  1. 생성된 저장소 화면 중앙의 **"uploading an existing file"** 링크를 클릭합니다.
  2. 폴더 내의 `index.html`, `style.css`, `script.js`, `README.md`, `.gitignore`, `LICENSE` 파일을 드래그하여 올립니다.
  3. 하단의 **[Commit changes]** 버튼을 클릭합니다.

- **방법 B: Git 터미널 CLI 명령어 사용**
  ```bash
  git init
  git add index.html style.css script.js README.md .gitignore LICENSE
  git commit -m "feat: initial commit for img2pdf web application"
  git branch -M main
  git remote add origin https://github.com/<본인-깃허브-아이디>/<저장소-이름>.git
  git push -u origin main
  ```

### 3단계: GitHub Pages 기능 활성화
1. GitHub 저장소 상단 탭에서 **[Settings]**를 클릭합니다.
2. 좌측 메뉴 사이드바에서 **[Pages]** 메뉴를 선택합니다.
3. **Build and deployment** 항목의 **Source**를 **[Deploy from a branch]**로 설정합니다.
4. **Branch** 설정에서:
   - 브랜치: `main` (또는 `master`) 선택
   - 폴더: `/ (root)` 선택
5. 우측의 **[Save]** 버튼을 클릭합니다.

### 4단계: 배포 완료 및 접속
1. 약 1~2분 후 Settings > Pages 상단에 녹색 배너와 함께 다음과 같은 접속 링크가 표시됩니다.
   > **"Your site is live at https://<본인-깃허브-아이디>.github.io/<저장소-이름>/"**
2. 해당 URL을 클릭하면 모바일, 태블릿, PC 어디서든 즉시 이미지를 PDF로 변환할 수 있습니다!

---

## 🛠️ 기술 스택

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Libraries (CDN)**:
  - [jsPDF (v2.5.1)](https://github.com/parallax/jsPDF): 브라우저 단 PDF 생성 및 렌더링
  - [SortableJS (v1.15.2)](https://github.com/SortableJS/Sortable): 드래그 앤 드롭 순서 변경
- **Hosting**: GitHub Pages (Static Hosting)

---

## 📄 라이선스 (License)

이 프로젝트는 [MIT License](LICENSE)에 따라 자유롭게 사용, 수정 및 배포할 수 있습니다.
