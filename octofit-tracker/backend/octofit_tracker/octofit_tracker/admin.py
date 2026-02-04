from django.contrib import admin
from .models import User, Team, Activity, Leaderboard, Workout


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['_id', 'username', 'email', 'created_at']
    search_fields = ['username', 'email']
    readonly_fields = ['_id', 'created_at']


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['_id', 'name', 'created_by', 'created_at']
    search_fields = ['name']
    readonly_fields = ['_id', 'created_at']


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['_id', 'user_id', 'activity_type', 'duration', 'distance', 'calories', 'date']
    list_filter = ['activity_type', 'date']
    search_fields = ['user_id', 'activity_type']
    readonly_fields = ['_id']


@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ['_id', 'user_id', 'team_id', 'total_activities', 'total_duration', 'total_distance', 'total_calories', 'rank']
    list_filter = ['team_id']
    search_fields = ['user_id', 'team_id']
    readonly_fields = ['_id', 'last_updated']


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ['_id', 'name', 'category', 'difficulty_level', 'duration', 'created_at']
    list_filter = ['category', 'difficulty_level']
    search_fields = ['name', 'category']
    readonly_fields = ['_id', 'created_at']
