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