Okay, this is a great way to assess candidates! A 2-hour task needs to be well-scoped. We'll create a mini "Fund Investment Insight" portal.

**Goal:** Simulate a scenario where the candidate needs to:
1.  Understand a small, existing codebase.
2.  Fix a bug in the backend.
3.  Fix a bug/UI glitch in the frontend.
4.  Implement a small new feature involving both backend and frontend.

**Technology Stack:**
*   **Backend:** Django, Django REST Framework, PostgreSQL (but we'll use SQLite for the take-home for simplicity, mentioning Postgres is our production DB).
*   **Frontend:** React.js, Axios (for API calls).

---

**Base Repo Structure (Conceptual - You'll need to create these files):**

```
fund-insights-takehome/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── fund_project/             # Django Project
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── insights_app/             # Django App
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── migrations/
│   │   ├── models.py             # Article, Fund, Comment
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   └── db.sqlite3                # Initial seeded database
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── ArticleList.js
│   │   │   ├── ArticleDetail.js
│   │   │   └── NewCommentForm.js
│   │   └── services/
│   │       └── api.js
│   ├── package.json
│   └── README.md                 # Frontend specific instructions
├── .gitignore
└── README.md                     # Main README with setup and tasks
```

---

**Base Repo Content Details:**

**1. `backend/` (Django)**

*   **`requirements.txt`**:
    ```
    django
    djangorestframework
    django-cors-headers
    # psycopg2-binary (comment out for take-home, use sqlite)
    ```
*   **`fund_project/settings.py`**:
    *   Standard Django settings.
    *   `INSTALLED_APPS`: Add `rest_framework`, `corsheaders`, `insights_app`.
    *   `MIDDLEWARE`: Add `corsheaders.middleware.CorsMiddleware`.
    *   `CORS_ALLOWED_ORIGINS`: `['http://localhost:3000']` (or whatever your React dev server runs on).
    *   `DATABASES`: Configured for `sqlite3`.
*   **`fund_project/urls.py`**:
    ```python
    from django.contrib import admin
    from django.urls import path, include

    urlpatterns = [
        path('admin/', admin.site.urls),
        path('api/', include('insights_app.urls')),
    ]
    ```
*   **`insights_app/models.py`**:
    ```python
    from django.db import models
    from django.utils import timezone

    class Fund(models.Model):
        name = models.CharField(max_length=100, unique=True)
        description = models.TextField()

        def __str__(self):
            return self.name

    class Article(models.Model):
        title = models.CharField(max_length=200)
        content = models.TextField()
        publication_date = models.DateTimeField(default=timezone.now)
        fund = models.ForeignKey(Fund, related_name='articles', on_delete=models.SET_NULL, null=True, blank=True)
        # BUG 1: Missing author field that should be displayed
        # author_name = models.CharField(max_length=100, default="Fund Insights Team") # Intentionally missing for Bug 1

        def __str__(self):
            return self.title

    class Comment(models.Model):
        article = models.ForeignKey(Article, related_name='comments', on_delete=models.CASCADE)
        author_email = models.EmailField() # Simplified, no user model
        text = models.TextField()
        created_date = models.DateTimeField(default=timezone.now)

        def __str__(self):
            return f"Comment by {self.author_email} on {self.article.title}"
    ```
*   **`insights_app/serializers.py`**:
    ```python
    from rest_framework import serializers
    from .models import Article, Fund, Comment

    class FundSerializer(serializers.ModelSerializer):
        class Meta:
            model = Fund
            fields = '__all__'

    class CommentSerializer(serializers.ModelSerializer):
        class Meta:
            model = Comment
            fields = ('id', 'article', 'author_email', 'text', 'created_date')
            read_only_fields = ('created_date',)

    class ArticleSerializer(serializers.ModelSerializer):
        comments = CommentSerializer(many=True, read_only=True)
        fund_name = serializers.CharField(source='fund.name', read_only=True, allow_null=True)
        # BUG 1 related: author_name should be here if it existed on model
        # author_name = serializers.CharField(read_only=True)

        class Meta:
            model = Article
            # BUG 2: 'publication_date' is missing from fields, so it's not serialized.
            fields = ('id', 'title', 'content', 'fund', 'fund_name', 'comments') # 'publication_date' missing
            # If 'author_name' was on model:
            # fields = ('id', 'title', 'content', 'publication_date', 'fund', 'fund_name', 'author_name', 'comments')
    ```
*   **`insights_app/views.py`**:
    ```python
    from rest_framework import viewsets, status
    from rest_framework.decorators import action
    from rest_framework.response import Response
    from .models import Article, Fund, Comment
    from .serializers import ArticleSerializer, FundSerializer, CommentSerializer

    class FundViewSet(viewsets.ReadOnlyModelViewSet): # Read-only for now
        queryset = Fund.objects.all()
        serializer_class = FundSerializer

    class ArticleViewSet(viewsets.ReadOnlyModelViewSet): # Read-only for now
        queryset = Article.objects.all().order_by('-publication_date') # Default ordering
        serializer_class = ArticleSerializer

        @action(detail=True, methods=['post'], serializer_class=CommentSerializer)
        def add_comment(self, request, pk=None):
            article = self.get_object()
            serializer = CommentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(article=article)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # No viewset for comments directly, they are nested under articles for creation
    ```
*   **`insights_app/urls.py`**:
    ```python
    from django.urls import path, include
    from rest_framework.routers import DefaultRouter
    from .views import ArticleViewSet, FundViewSet

    router = DefaultRouter()
    router.register(r'articles', ArticleViewSet)
    router.register(r'funds', FundViewSet)

    urlpatterns = [
        path('', include(router.urls)),
    ]
    ```
*   **`insights_app/admin.py`**: Register `Article`, `Fund`, `Comment`.
*   **Seed Data**: Create a migration or use Django admin to add:
    *   2-3 `Fund` objects.
    *   3-5 `Article` objects, some linked to Funds, some not.
    *   A few `Comment` objects on some articles.
    *   *Crucially*: Make sure `publication_date` has different values.

**2. `frontend/` (React)**

*   Use `create-react-app fund-insights-frontend`.
*   **`package.json`**: Add `axios`.
*   **`src/services/api.js`**:
    ```javascript
    import axios from 'axios';

    const API_URL = 'http://localhost:8000/api'; // Django dev server

    export const getArticles = () => axios.get(`${API_URL}/articles/`);
    export const getArticle = (id) => axios.get(`${API_URL}/articles/${id}/`);
    export const addComment = (articleId, commentData) =>
        axios.post(`${API_URL}/articles/${articleId}/add_comment/`, commentData);

    // Placeholder for new feature
    // export const getFunds = () => axios.get(`${API_URL}/funds/`);
    ```
*   **`src/components/ArticleList.js`**:
    ```javascript
    import React, { useState, useEffect } from 'react';
    import { Link } from 'react-router-dom'; // Assuming you'll add react-router-dom
    import { getArticles } from '../services/api';

    function ArticleList() {
        const [articles, setArticles] = useState([]);
        const [error, setError] = useState('');

        useEffect(() => {
            getArticles()
                .then(response => setArticles(response.data))
                .catch(err => {
                    console.error("Failed to fetch articles:", err);
                    setError("Failed to load articles. Please try again later.");
                });
        }, []);

        if (error) return <p style={{color: 'red'}}>{error}</p>;
        if (!articles.length) return <p>Loading articles...</p>;

        return (
            <div>
                <h2>Investment Insights</h2>
                <ul>
                    {articles.map(article => (
                        <li key={article.id}>
                            {/* BUG 3: Link is to a non-existent route or component for article detail view */}
                            <Link to={`/articles/${article.id}`}>{article.title}</Link>
                            {/* BUG 1 related: Would display author here if available
                            {article.author_name && <small> by {article.author_name}</small>}
                            */}
                            {/* BUG 2 related: Publication date is not displayed because it's not in API response */}
                            {article.publication_date && (
                                <small style={{ marginLeft: '10px', color: 'gray' }}>
                                    Published: {new Date(article.publication_date).toLocaleDateString()}
                                </small>
                            )}
                             {article.fund_name && <small style={{ marginLeft: '10px', color: 'blue' }}>Fund: {article.fund_name}</small>}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
    export default ArticleList;
    ```
*   **`src/components/ArticleDetail.js`**: (Basic, to be improved by candidate)
    ```javascript
    import React, { useState, useEffect } from 'react';
    import { useParams } from 'react-router-dom'; // Assuming react-router-dom
    import { getArticle } from '../services/api';
    // import NewCommentForm from './NewCommentForm'; // For later

    function ArticleDetail() {
        const { id } = useParams();
        const [article, setArticle] = useState(null);
        const [error, setError] = useState('');

        useEffect(() => {
            if (id) {
                getArticle(id)
                    .then(response => setArticle(response.data))
                    .catch(err => {
                        console.error(`Failed to fetch article ${id}:`, err);
                        setError(`Failed to load article ${id}.`);
                    });
            }
        }, [id]);

        if (error) return <p style={{color: 'red'}}>{error}</p>;
        if (!article) return <p>Loading article...</p>;

        return (
            <div>
                <h1>{article.title}</h1>
                {/* BUG 2 related: Publication date not shown */}
                {article.publication_date && <p><small>Published: {new Date(article.publication_date).toLocaleDateString()}</small></p>}
                {article.fund_name && <p><small>Related Fund: {article.fund_name}</small></p>}
                <div dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }} /> {/* Basic content rendering */}

                <h3>Comments</h3>
                {article.comments && article.comments.length > 0 ? (
                    <ul>
                        {article.comments.map(comment => (
                            <li key={comment.id}>
                                <p>{comment.text}</p>
                                <small>By: {comment.author_email} on {new Date(comment.created_date).toLocaleString()}</small>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No comments yet.</p>
                )}
                {/* <NewCommentForm articleId={article.id} onCommentAdded={(newComment) => setArticle({...article, comments: [...article.comments, newComment]})}/> */}
            </div>
        );
    }
    export default ArticleDetail;
    ```
*   **`src/components/NewCommentForm.js`**: (Shell, part of a task or for future)
    ```javascript
    // Basic structure, candidate might flesh this out or you can pre-fill more
    import React, { useState } from 'react';
    import { addComment } from '../services/api';

    function NewCommentForm({ articleId, onCommentAdded }) {
        const [email, setEmail] = useState('');
        const [text, setText] = useState('');
        const [error, setError] = useState('');
        const [success, setSuccess] = useState('');

        const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            setSuccess('');
            if (!email || !text) {
                setError("Email and comment text are required.");
                return;
            }
            try {
                const response = await addComment(articleId, { author_email: email, text });
                onCommentAdded(response.data);
                setEmail('');
                setText('');
                setSuccess('Comment added successfully!');
            } catch (err) {
                setError('Failed to add comment. ' + (err.response?.data?.detail || err.message));
            }
        };

        return (
            <form onSubmit={handleSubmit}>
                <h4>Add a Comment</h4>
                {error && <p style={{color: 'red'}}>{error}</p>}
                {success && <p style={{color: 'green'}}>{success}</p>}
                <div>
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="text">Comment:</label>
                    <textarea id="text" value={text} onChange={e => setText(e.target.value)} required />
                </div>
                <button type="submit">Submit Comment</button>
            </form>
        );
    }
    export default NewCommentForm;
    ```
*   **`src/App.js`**:
    ```javascript
    import React from 'react';
    import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
    import ArticleList from './components/ArticleList';
    import ArticleDetail from './components/ArticleDetail';
    // import FundList from './components/FundList'; // For new feature

    function App() {
        return (
            <Router>
                <div>
                    <nav>
                        <Link to="/">Home (Articles)</Link>
                        {/* Link for new feature: <Link to="/funds" style={{marginLeft: '10px'}}>Funds</Link> */}
                    </nav>
                    <hr />
                    <Routes>
                        <Route path="/" element={<ArticleList />} />
                        <Route path="/articles/:id" element={<ArticleDetail />} />
                        {/* Route for new feature: <Route path="/funds" element={<FundList />} /> */}
                    </Routes>
                </div>
            </Router>
        );
    }
    export default App;
    ```
*   **`frontend/README.md`**: Standard CRA readme, add note about `npm start`.

**3. Root `README.md`**

This is crucial.

```markdown
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
3.  Alternatively, if you forked this on a platform like GitHub/GitLab, push your changes to a new branch and create a Pull Request.
4.  Zip your entire project folder (excluding `node_modules` and `venv`) and send it back, or provide the link to your PR.

## Evaluation Criteria

*   **Correctness:** Do the bug fixes work as expected? Is the new feature implemented correctly?
*   **Code Quality:** Is the code clean, readable, and maintainable?
*   **Understanding:** Does the solution demonstrate an understanding of Django, DRF, and React?
*   **Problem-solving:** How did you approach the tasks? (Clear commit messages help here).
*   **Bonus:**
    *   Adding simple error handling (e.g., if API calls fail).
    *   Writing any unit tests (Django or Jest/React Testing Library) for your changes, if time permits.

Good luck! We look forward to seeing your solution.
```

---

**Pre-computation / Intentional Bugs for the Candidate:**

*   **Bug 2 (Backend - Missing `publication_date`):** In `insights_app/serializers.py`, `ArticleSerializer`'s `Meta.fields` tuple intentionally omits `'publication_date'`.
*   **Bug 3 (Frontend - Broken Detail Link / Component):**
    *   Ensure `react-router-dom` is in `frontend/package.json`.
    *   `App.js` is set up with routes.
    *   The `ArticleDetail.js` component is present but might have a minor issue in its `useEffect` or how it displays data, or the `NewCommentForm` integration part is what they need to complete. The task focuses on making sure the navigation *works* and the comment form is functional.

**Final Steps for You:**

1.  Actually create this project structure and fill in the files.
2.  Seed the `db.sqlite3` with some sample data via `python manage.py createsuperuser` and the Django admin, or a custom management command.
3.  Test the setup instructions yourself to ensure they are flawless.
4.  Verify the bugs exist as intended.
5.  Zip up the base project (excluding `venv`, `node_modules`, `__pycache__`) to give to candidates, or host it on a private Git repo they can fork.

This setup provides a solid foundation for a 2-hour take-home that touches on the key skills you want to assess. Remember to adjust complexity if you find candidates struggle or finish too quickly during trials.