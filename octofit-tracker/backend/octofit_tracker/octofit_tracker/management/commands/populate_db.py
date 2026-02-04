from django.core.management.base import BaseCommand
from pymongo import MongoClient
from datetime import datetime, timedelta
import random


class Command(BaseCommand):
    help = 'Populate the octofit_db database with test data'

    def handle(self, *args, **kwargs):
        # Connect to MongoDB
        client = MongoClient('localhost', 27017)
        db = client['octofit_db']

        self.stdout.write(self.style.SUCCESS('Starting database population...'))

        # Clear existing data
        self.stdout.write('Clearing existing data...')
        db.users.delete_many({})
        db.teams.delete_many({})
        db.activities.delete_many({})
        db.leaderboard.delete_many({})
        db.workouts.delete_many({})

        # Create unique index on email field
        self.stdout.write('Creating unique index on email field...')
        db.users.create_index('email', unique=True)

        # Insert Teams
        self.stdout.write('Inserting teams...')
        teams = [
            {
                '_id': 1,
                'name': 'Team Marvel',
                'description': 'Earth\'s Mightiest Heroes',
                'created_at': datetime.now()
            },
            {
                '_id': 2,
                'name': 'Team DC',
                'description': 'Justice League United',
                'created_at': datetime.now()
            }
        ]
        db.teams.insert_many(teams)

        # Insert Users (Superheroes)
        self.stdout.write('Inserting users (superheroes)...')
        users = [
            # Team Marvel
            {
                '_id': 1,
                'name': 'Tony Stark',
                'email': 'ironman@marvel.com',
                'team_id': 1,
                'role': 'hero',
                'created_at': datetime.now()
            },
            {
                '_id': 2,
                'name': 'Steve Rogers',
                'email': 'captainamerica@marvel.com',
                'team_id': 1,
                'role': 'hero',
                'created_at': datetime.now()
            },
            {
                '_id': 3,
                'name': 'Natasha Romanoff',
                'email': 'blackwidow@marvel.com',
                'team_id': 1,
                'role': 'hero',
                'created_at': datetime.now()
            },
            {
                '_id': 4,
                'name': 'Bruce Banner',
                'email': 'hulk@marvel.com',
                'team_id': 1,
                'role': 'hero',
                'created_at': datetime.now()
            },
            {
                '_id': 5,
                'name': 'Thor Odinson',
                'email': 'thor@marvel.com',
                'team_id': 1,
                'role': 'hero',
                'created_at': datetime.now()
            },
            # Team DC
            {
                '_id': 6,
                'name': 'Bruce Wayne',
                'email': 'batman@dc.com',
                'team_id': 2,
                'role': 'hero',
                'created_at': datetime.now()
            },
            {
                '_id': 7,
                'name': 'Clark Kent',
                'email': 'superman@dc.com',
                'team_id': 2,
                'role': 'hero',
                'created_at': datetime.now()
            },
            {
                '_id': 8,
                'name': 'Diana Prince',
                'email': 'wonderwoman@dc.com',
                'team_id': 2,
                'role': 'hero',
                'created_at': datetime.now()
            },
            {
                '_id': 9,
                'name': 'Barry Allen',
                'email': 'flash@dc.com',
                'team_id': 2,
                'role': 'hero',
                'created_at': datetime.now()
            },
            {
                '_id': 10,
                'name': 'Arthur Curry',
                'email': 'aquaman@dc.com',
                'team_id': 2,
                'role': 'hero',
                'created_at': datetime.now()
            }
        ]
        db.users.insert_many(users)

        # Insert Activities
        self.stdout.write('Inserting activities...')
        activities = []
        activity_types = ['running', 'cycling', 'swimming', 'weightlifting', 'combat training', 'flight training']
        activity_id = 1

        for user in users:
            for _ in range(random.randint(5, 10)):
                activity_type = random.choice(activity_types)
                duration = random.randint(30, 180)  # minutes
                distance = random.uniform(1, 50) if activity_type in ['running', 'cycling', 'swimming'] else 0
                calories = duration * random.uniform(5, 15)
                
                activities.append({
                    '_id': activity_id,
                    'user_id': user['_id'],
                    'type': activity_type,
                    'duration': duration,
                    'distance': round(distance, 2),
                    'calories_burned': round(calories, 2),
                    'date': datetime.now() - timedelta(days=random.randint(0, 30)),
                    'notes': f'{user["name"]} completed {activity_type}'
                })
                activity_id += 1

        db.activities.insert_many(activities)

        # Calculate and insert Leaderboard
        self.stdout.write('Calculating leaderboard...')
        leaderboard = []
        
        for user in users:
            user_activities = [a for a in activities if a['user_id'] == user['_id']]
            total_calories = sum(a['calories_burned'] for a in user_activities)
            total_duration = sum(a['duration'] for a in user_activities)
            total_distance = sum(a['distance'] for a in user_activities)
            activity_count = len(user_activities)
            
            leaderboard.append({
                'user_id': user['_id'],
                'user_name': user['name'],
                'team_id': user['team_id'],
                'total_calories': round(total_calories, 2),
                'total_duration': total_duration,
                'total_distance': round(total_distance, 2),
                'activity_count': activity_count,
                'rank': 0  # Will be set after sorting
            })

        # Sort by total_calories and assign ranks
        leaderboard.sort(key=lambda x: x['total_calories'], reverse=True)
        for idx, entry in enumerate(leaderboard, start=1):
            entry['rank'] = idx

        db.leaderboard.insert_many(leaderboard)

        # Insert Workouts (Personalized suggestions)
        self.stdout.write('Inserting workout suggestions...')
        workouts = [
            {
                '_id': 1,
                'name': 'Arc Reactor Cardio',
                'description': 'High-intensity interval training for tech heroes',
                'type': 'cardio',
                'difficulty': 'advanced',
                'duration': 45,
                'exercises': [
                    {'name': 'Repulsor blast simulation', 'sets': 3, 'reps': 15},
                    {'name': 'Flight stance holds', 'sets': 3, 'duration': 60}
                ]
            },
            {
                '_id': 2,
                'name': 'Super Soldier Strength',
                'description': 'Captain America\'s workout routine',
                'type': 'strength',
                'difficulty': 'advanced',
                'duration': 60,
                'exercises': [
                    {'name': 'Shield throws', 'sets': 4, 'reps': 20},
                    {'name': 'Star-spangled squats', 'sets': 4, 'reps': 25}
                ]
            },
            {
                '_id': 3,
                'name': 'Asgardian Power',
                'description': 'Thor\'s legendary strength training',
                'type': 'strength',
                'difficulty': 'expert',
                'duration': 75,
                'exercises': [
                    {'name': 'Mjolnir lifts', 'sets': 5, 'reps': 10},
                    {'name': 'Thunder claps', 'sets': 4, 'reps': 15}
                ]
            },
            {
                '_id': 4,
                'name': 'Dark Knight Training',
                'description': 'Batman\'s combat preparation',
                'type': 'combat training',
                'difficulty': 'advanced',
                'duration': 90,
                'exercises': [
                    {'name': 'Grappling hook pulls', 'sets': 4, 'reps': 12},
                    {'name': 'Batarang throws', 'sets': 5, 'reps': 20}
                ]
            },
            {
                '_id': 5,
                'name': 'Kryptonian Endurance',
                'description': 'Superman\'s endurance workout',
                'type': 'cardio',
                'difficulty': 'expert',
                'duration': 60,
                'exercises': [
                    {'name': 'Super-speed sprints', 'sets': 5, 'duration': 120},
                    {'name': 'Flight drills', 'sets': 3, 'duration': 180}
                ]
            },
            {
                '_id': 6,
                'name': 'Amazonian Warrior',
                'description': 'Wonder Woman\'s complete routine',
                'type': 'strength',
                'difficulty': 'advanced',
                'duration': 70,
                'exercises': [
                    {'name': 'Lasso swings', 'sets': 4, 'reps': 15},
                    {'name': 'Shield blocks', 'sets': 4, 'reps': 20}
                ]
            },
            {
                '_id': 7,
                'name': 'Speed Force Sprint',
                'description': 'Flash\'s speed training',
                'type': 'cardio',
                'difficulty': 'expert',
                'duration': 30,
                'exercises': [
                    {'name': 'Lightning runs', 'sets': 10, 'duration': 30},
                    {'name': 'Phasing practice', 'sets': 5, 'reps': 10}
                ]
            },
            {
                '_id': 8,
                'name': 'Atlantean Swim',
                'description': 'Aquaman\'s underwater workout',
                'type': 'swimming',
                'difficulty': 'advanced',
                'duration': 60,
                'exercises': [
                    {'name': 'Trident thrusts', 'sets': 4, 'reps': 20},
                    {'name': 'Deep sea dives', 'sets': 3, 'duration': 300}
                ]
            }
        ]
        db.workouts.insert_many(workouts)

        self.stdout.write(self.style.SUCCESS(f'Successfully populated database!'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(teams)} teams'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(users)} users'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(activities)} activities'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(leaderboard)} leaderboard entries'))
        self.stdout.write(self.style.SUCCESS(f'  - {len(workouts)} workouts'))

        client.close()
