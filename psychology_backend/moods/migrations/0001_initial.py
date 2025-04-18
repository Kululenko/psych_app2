# Generated by Django 4.2.7 on 2025-03-01 18:26

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='MoodEntry',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mood', models.CharField(choices=[('verygood', 'Sehr gut'), ('good', 'Gut'), ('neutral', 'Neutral'), ('bad', 'Schlecht'), ('verybad', 'Sehr schlecht')], max_length=10, verbose_name='Stimmung')),
                ('notes', models.TextField(blank=True, verbose_name='Notizen')),
                ('date', models.DateField(default=django.utils.timezone.now, verbose_name='Datum')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
            ],
            options={
                'verbose_name': 'Stimmungseintrag',
                'verbose_name_plural': 'Stimmungseinträge',
                'ordering': ['-date', '-created_at'],
            },
        ),
        migrations.CreateModel(
            name='MoodFactor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
            ],
            options={
                'verbose_name': 'Stimmungsfaktor',
                'verbose_name_plural': 'Stimmungsfaktoren',
            },
        ),
        migrations.CreateModel(
            name='MoodStats',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('average_mood', models.FloatField(default=3.0, verbose_name='Durchschnittliche Stimmung')),
                ('streak_days', models.PositiveIntegerField(default=0, verbose_name='Tage in Folge mit Tracking')),
                ('last_entry_date', models.DateField(blank=True, null=True, verbose_name='Datum des letzten Eintrags')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Aktualisiert am')),
            ],
            options={
                'verbose_name': 'Stimmungsstatistik',
                'verbose_name_plural': 'Stimmungsstatistiken',
            },
        ),
    ]
