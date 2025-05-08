from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ArticleViewSet, FundViewSet

router = DefaultRouter()
router.register(r'articles', ArticleViewSet)
router.register(r'funds', FundViewSet)

urlpatterns = [
    path('', include(router.urls)),
]