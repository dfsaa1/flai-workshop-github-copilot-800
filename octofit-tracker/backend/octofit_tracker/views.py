from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from pymongo import MongoClient
from .models import User, Team, Activity, Leaderboard, Workout
from .serializers import (
    UserSerializer, TeamSerializer, ActivitySerializer,
    LeaderboardSerializer, WorkoutSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.none()  # Disable default queryset
    serializer_class = TeamSerializer
    
    def list(self, request):
        """Override list to fetch directly from MongoDB"""
        try:
            client = MongoClient('localhost', 27017)
            db = client['octofit_db']
            teams_data = list(db.teams.find())
            
            # Convert MongoDB _id to string and ensure proper field names
            for team in teams_data:
                if '_id' in team:
                    team['id'] = str(team['_id'])
                # Ensure members is properly formatted
                if 'members' not in team:
                    team['members'] = []
                    
            client.close()
            return Response(teams_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def retrieve(self, request, pk=None):
        """Override retrieve to fetch directly from MongoDB"""
        try:
            client = MongoClient('localhost', 27017)
            db = client['octofit_db']
            
            # Try to convert pk to int
            try:
                team_id = int(pk)
            except ValueError:
                team_id = pk
                
            team_data = db.teams.find_one({'_id': team_id})
            client.close()
            
            if team_data:
                team_data['id'] = str(team_data['_id'])
                if 'members' not in team_data:
                    team_data['members'] = []
                return Response(team_data)
            return Response({'error': 'Team not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to a team"""
        try:
            client = MongoClient('localhost', 27017)
            db = client['octofit_db']
            
            # Try to convert pk to int
            try:
                team_id = int(pk)
            except ValueError:
                team_id = pk
                
            user_id = request.data.get('user_id')
            if not user_id:
                return Response({'error': 'user_id is required'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            team = db.teams.find_one({'_id': team_id})
            if not team:
                client.close()
                return Response({'error': 'Team not found'}, 
                              status=status.HTTP_404_NOT_FOUND)
            
            members = team.get('members', [])
            if user_id not in members:
                members.append(user_id)
                db.teams.update_one({'_id': team_id}, {'$set': {'members': members}})
            
            updated_team = db.teams.find_one({'_id': team_id})
            updated_team['id'] = str(updated_team['_id'])
            client.close()
            return Response(updated_team)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Remove a member from a team"""
        try:
            client = MongoClient('localhost', 27017)
            db = client['octofit_db']
            
            # Try to convert pk to int
            try:
                team_id = int(pk)
            except ValueError:
                team_id = pk
                
            user_id = request.data.get('user_id')
            if not user_id:
                return Response({'error': 'user_id is required'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            team = db.teams.find_one({'_id': team_id})
            if not team:
                client.close()
                return Response({'error': 'Team not found'}, 
                              status=status.HTTP_404_NOT_FOUND)
            
            members = team.get('members', [])
            if user_id in members:
                members.remove(user_id)
                db.teams.update_one({'_id': team_id}, {'$set': {'members': members}})
            else:
                client.close()
                return Response({'error': 'User not found in team'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            updated_team = db.teams.find_one({'_id': team_id})
            updated_team['id'] = str(updated_team['_id'])
            client.close()
            return Response(updated_team)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    
    @action(detail=False, methods=['get'])
    def user_activities(self, request):
        user_id = request.query_params.get('user_id')
        if user_id:
            activities = Activity.objects.filter(user_id=user_id)
            serializer = self.get_serializer(activities, many=True)
            return Response(serializer.data)
        return Response({'error': 'user_id parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)


class LeaderboardViewSet(viewsets.ModelViewSet):
    queryset = Leaderboard.objects.all()
    serializer_class = LeaderboardSerializer
    
    @action(detail=False, methods=['get'])
    def top_users(self, request):
        limit = int(request.query_params.get('limit', 10))
        leaderboard = Leaderboard.objects.order_by('-total_calories')[:limit]
        serializer = self.get_serializer(leaderboard, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def team_leaderboard(self, request):
        team_id = request.query_params.get('team_id')
        if team_id:
            leaderboard = Leaderboard.objects.filter(team_id=team_id).order_by('-total_calories')
            serializer = self.get_serializer(leaderboard, many=True)
            return Response(serializer.data)
        return Response({'error': 'team_id parameter required'}, 
                       status=status.HTTP_400_BAD_REQUEST)


class WorkoutViewSet(viewsets.ModelViewSet):
    queryset = Workout.objects.none()  # Disable default queryset
    serializer_class = WorkoutSerializer
    
    def list(self, request):
        """Override list to fetch directly from MongoDB"""
        try:
            client = MongoClient('localhost', 27017)
            db = client['octofit_db']
            workouts_data = list(db.workouts.find())
            
            # Convert MongoDB _id to string and ensure proper field names
            for workout in workouts_data:
                if '_id' in workout:
                    workout['id'] = str(workout['_id'])
                # Ensure exercises is properly formatted
                if 'exercises' not in workout:
                    workout['exercises'] = []
                    
            client.close()
            return Response(workouts_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def retrieve(self, request, pk=None):
        """Override retrieve to fetch directly from MongoDB"""
        try:
            client = MongoClient('localhost', 27017)
            db = client['octofit_db']
            
            # Try to convert pk to int
            try:
                workout_id = int(pk)
            except ValueError:
                workout_id = pk
                
            workout_data = db.workouts.find_one({'_id': workout_id})
            client.close()
            
            if workout_data:
                workout_data['id'] = str(workout_data['_id'])
                if 'exercises' not in workout_data:
                    workout_data['exercises'] = []
                return Response(workout_data)
            return Response({'error': 'Workout not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category = request.query_params.get('category')
        if not category:
            return Response({'error': 'category parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            client = MongoClient('localhost', 27017)
            db = client['octofit_db']
            workouts_data = list(db.workouts.find({'category': category}))
            
            for workout in workouts_data:
                if '_id' in workout:
                    workout['id'] = str(workout['_id'])
                if 'exercises' not in workout:
                    workout['exercises'] = []
                    
            client.close()
            return Response(workouts_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def by_difficulty(self, request):
        difficulty = request.query_params.get('difficulty')
        if not difficulty:
            return Response({'error': 'difficulty parameter required'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            client = MongoClient('localhost', 27017)
            db = client['octofit_db']
            workouts_data = list(db.workouts.find({'difficulty_level': difficulty}))
            
            for workout in workouts_data:
                if '_id' in workout:
                    workout['id'] = str(workout['_id'])
                if 'exercises' not in workout:
                    workout['exercises'] = []
                    
            client.close()
            return Response(workouts_data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
