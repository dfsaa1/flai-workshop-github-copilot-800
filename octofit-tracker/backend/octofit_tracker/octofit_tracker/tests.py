from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import User, Team, Activity, Leaderboard, Workout
from datetime import datetime


class UserModelTest(TestCase):
    def test_create_user(self):
        user = User.objects.create(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertIsNotNone(user._id)


class TeamModelTest(TestCase):
    def test_create_team(self):
        team = Team.objects.create(
            name='Test Team',
            description='A test team',
            created_by='user123',
            members=['user123', 'user456']
        )
        self.assertEqual(team.name, 'Test Team')
        self.assertEqual(len(team.members), 2)


class ActivityModelTest(TestCase):
    def test_create_activity(self):
        activity = Activity.objects.create(
            user_id='user123',
            activity_type='Running',
            duration=30,
            distance=5.0,
            calories=300,
            date=datetime.now()
        )
        self.assertEqual(activity.activity_type, 'Running')
        self.assertEqual(activity.duration, 30)


class LeaderboardModelTest(TestCase):
    def test_create_leaderboard_entry(self):
        entry = Leaderboard.objects.create(
            user_id='user123',
            total_activities=10,
            total_duration=300,
            total_distance=50.0,
            total_calories=3000
        )
        self.assertEqual(entry.total_activities, 10)
        self.assertEqual(entry.total_calories, 3000)


class WorkoutModelTest(TestCase):
    def test_create_workout(self):
        workout = Workout.objects.create(
            name='Morning Run',
            description='A refreshing morning run',
            category='Cardio',
            difficulty_level='intermediate',
            duration=45,
            exercises=[{'name': 'Running', 'duration': 45}]
        )
        self.assertEqual(workout.name, 'Morning Run')
        self.assertEqual(workout.difficulty_level, 'intermediate')


class UserAPITest(APITestCase):
    def test_create_user_via_api(self):
        url = '/api/users/'
        data = {
            'username': 'apiuser',
            'email': 'api@example.com',
            'password': 'apipass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)


class TeamAPITest(APITestCase):
    def test_create_team_via_api(self):
        url = '/api/teams/'
        data = {
            'name': 'API Team',
            'description': 'Team created via API',
            'created_by': 'user123',
            'members': []
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class ActivityAPITest(APITestCase):
    def test_create_activity_via_api(self):
        url = '/api/activities/'
        data = {
            'user_id': 'user123',
            'activity_type': 'Cycling',
            'duration': 60,
            'distance': 20.0,
            'calories': 500,
            'date': datetime.now().isoformat(),
            'notes': 'Great ride!'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


class LeaderboardAPITest(APITestCase):
    def test_get_top_users(self):
        # Create test leaderboard entries
        Leaderboard.objects.create(user_id='user1', total_calories=1000)
        Leaderboard.objects.create(user_id='user2', total_calories=2000)
        
        url = '/api/leaderboard/top_users/'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class WorkoutAPITest(APITestCase):
    def test_create_workout_via_api(self):
        url = '/api/workouts/'
        data = {
            'name': 'HIIT Workout',
            'description': 'High intensity interval training',
            'category': 'Cardio',
            'difficulty_level': 'advanced',
            'duration': 30,
            'exercises': [
                {'name': 'Burpees', 'duration': 5},
                {'name': 'Jump Squats', 'duration': 5}
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
