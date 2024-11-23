from django.core.management.base import BaseCommand
from users.models import User

class Command(BaseCommand):
    help = 'Змінює роль користувача на суперюзера'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str)

    def handle(self, *args, **kwargs):
        username = kwargs['username']
        try:
            user = User.objects.get(username=username)
            user.role = 'superuser'
            user.is_superuser = True
            user.is_staff = True
            user.save()
            self.stdout.write(self.style.SUCCESS(f'Користувач {username} тепер суперюзер'))
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Користувач {username} не знайдений'))
