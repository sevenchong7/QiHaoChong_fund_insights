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
    fund_name = serializers.CharField(
        source="fund.name", read_only=True, allow_null=True
    )

    class Meta:
        model = Article
        # 'publication_date' is intentionally missing here for Task 2
        fields = ("id", "title", "content","publication_date", "fund", "fund_name", "comments") #add the missing publication_date into the fields to ensure the date is pass throught to frontend
