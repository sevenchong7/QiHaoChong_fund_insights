# Fund Insights Take-Home Assignment

Welcome! This assignment is designed to simulate some common tasks you might encounter as a Full Stack Developer at our company. It involves analyzing an existing codebase, fixing some bugs, and implementing a new feature.

**Time Allotment:** Please aim to complete this within 2 hours. Focus on functional correctness and clear code.

**Tech Stack:**
*   Backend: Django (with Django REST Framework)
*   Frontend: React.js
*   Database: SQLite (for this assignment, though we use PostgreSQL in production)

## Setup Instructions

1.  **Clone the repository.**
2.  **Backend Setup:**
    *   Navigate to the `backend/` directory.
    *   Create a Python virtual environment: `python -m venv venv`
    *   Activate it:
        *   macOS/Linux: `source venv/bin/activate`
        *   Windows: `venv\Scripts\activate`
    *   Install dependencies: `pip install -r requirements.txt`
    *   Run migrations: `python manage.py migrate` (The initial database `db.sqlite3` is provided with seed data, but migrations ensure schema is current).
    *   Start the Django development server: `python manage.py runserver` (Usually runs on `http://localhost:8000`)
3.  **Frontend Setup:**
    *   Open a new terminal.
    *   Navigate to the `frontend/` directory.
    *   Install dependencies: `npm install`
    *   Start the React development server: `npm start` (Usually runs on `http://localhost:3000`)

You should now be able to open `http://localhost:3000` in your browser and see the basic application.

## Tasks

Please complete the following tasks. Commit your changes frequently with clear messages.

**Task 1: Analyze Codebase & Identify Issues (Mental Walkthrough)**

*   Familiarize yourself with the Django models (`backend/insights_app/models.py`), serializers (`serializers.py`), and views (`views.py`).
*   Look through the React components (`frontend/src/components/`) and API service (`frontend/src/services/api.js`).
*   Understand how data flows from the backend to the frontend.

**Task 2: Backend Bug Fix - Missing Article Publication Date**

*   **Bug:** The `publication_date` of articles is not being sent by the API, and thus not displayed on the frontend (neither in the list nor detail view).
*   **Requirement:** Modify the backend (likely the `ArticleSerializer`) so that `publication_date` is included in the API response for articles.
*   **Verification:** After your fix, the publication date should appear on the frontend where placeholders for it exist.

**Task 3: Frontend Bug Fix - Broken Article Detail Link/View**

*   **Bug:** Clicking on an article title in the `ArticleList` component might lead to an error or a non-functional detail page because `react-router-dom` might not be fully set up, or the `ArticleDetail` component might not be correctly fetching/displaying data. (Ensure `react-router-dom` is installed if not already there from CRA).
*   **Requirement:**
    1. Ensure `react-router-dom` is installed and `App.js` is correctly configured for routing to `ArticleDetail` using the article's ID.
    2. The `ArticleDetail.js` component should correctly fetch and display the full article content, title, and any other available details (like comments and the now-fixed publication date).
    3. Make sure the `NewCommentForm` component (already partially created) is integrated into `ArticleDetail.js` and allows users to submit new comments for an article. The form should handle submissions and optimistically update the UI or refresh comments.
*   **Verification:** You can navigate to an article's detail page, see its content, and successfully add a new comment.

**Task 4: New Feature - Display List of Funds**

*   **Requirement:** Implement a new section in the application to display a list of all available Investment Funds.
    *   **Backend:**
        *   The `FundViewSet` and `FundSerializer` are already partially created. Ensure they are functional and serve a list of funds at an appropriate API endpoint (e.g., `/api/funds/`).
    *   **Frontend:**
        *   Create a new React component (e.g., `FundList.js`).
        *   This component should fetch the list of funds from the backend API.
        *   Display the name and description of each fund.
        *   Add a link in the main navigation (e.g., in `App.js`) to navigate to this new "Funds" page.
*   **Verification:** A new "Funds" link in the navigation takes you to a page listing all funds with their names and descriptions.

## Submission

1.  Ensure all your changes are committed to your local Git repository.
2.  Create a patch file from your commits: `git format-patch origin/main --stdout > your_name_fund_insights.patch` (assuming `origin/main` is the base).

## Evaluation Criteria

*   **Correctness:** Do the bug fixes work as expected? Is the new feature implemented correctly?
*   **Code Quality:** Is the code clean, readable, and maintainable?
*   **Understanding:** Does the solution demonstrate an understanding of Django, DRF, and React?
*   **Problem-solving:** How did you approach the tasks? (Clear commit messages help here).
*   **Bonus:**
    *   Adding simple error handling (e.g., if API calls fail).
    *   Writing any unit tests (Django or Jest/React Testing Library) for your changes, if time permits.

Good luck! We look forward to seeing your solution.