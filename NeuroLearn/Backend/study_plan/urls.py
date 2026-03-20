from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.StudyPlanCreateView.as_view(), name='study_plan_create'),
    path('<int:pk>/delete/', views.StudyPlanDeleteView.as_view(), name='study_plan_delete'),
    path('<int:plan_id>/', views.StudyPlanDetailView.as_view(), name='study-plan-detail'),
    path('<int:plan_id>/start-session/', views.StartSessionView.as_view(), name='start-session'),
    path('sessions/<int:session_id>/unlock/', views.UnlockSessionView.as_view(), name='unlock-session'),
    path('sessions/<int:session_id>/', views.StudySessionDetailView.as_view(), name='session-detail'),
    path('sub-sessions/<int:sub_session_id>/feedback/', views.SubSessionFeedbackView.as_view(), name='sub-session-feedback'),
    path('sessions/<int:session_id>/trigger-topics/', views.TriggerSessionTopicsView.as_view(), name='trigger-session-topics'),
    path('sub-sessions/<int:sub_session_id>/trigger-content/', views.TriggerSubSessionContentView.as_view(), name='trigger-sub-session-content'),
    path('', views.StudyPlanListView.as_view(), name='study_plan_list'),
]
