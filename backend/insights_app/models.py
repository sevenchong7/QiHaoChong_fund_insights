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