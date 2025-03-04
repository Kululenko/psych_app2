# Generated by Django 4.2.7 on 2025-03-01 18:26

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('moods', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='moodstats',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='mood_stats', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='moodfactor',
            name='entry',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='factors', to='moods.moodentry'),
        ),
        migrations.AddField(
            model_name='moodentry',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='mood_entries', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterUniqueTogether(
            name='moodfactor',
            unique_together={('entry', 'name')},
        ),
        migrations.AlterUniqueTogether(
            name='moodentry',
            unique_together={('user', 'date')},
        ),
    ]
