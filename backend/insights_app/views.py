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