import os
import django
import datetime
from django.db import transaction

# Django Einrichtung
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'psychology_project.settings')
django.setup()

# Imports nach Django-Setup
from django.contrib.auth import get_user_model
from therapy.models import (
    Exercise, DailyPrompt, Achievement
)
from users.models import ResetPasswordToken
from breathing.models import BreathingTechnique, RecommendedTechnique
from chat.models import AIAssistantPrompt

User = get_user_model()


def create_superuser():
    """Erstellt einen Superuser für den Admin-Bereich."""
    try:
        if not User.objects.filter(email='admin@example.com').exists():
            User.objects.create_superuser(
                email='admin@example.com',
                username='admin',
                password='Admin123!',
                first_name='Admin',
                last_name='User'
            )
            print("Superuser erstellt.")
        else:
            print("Superuser existiert bereits.")
    except Exception as e:
        print(f"Fehler beim Erstellen des Superusers: {str(e)}")


def create_exercises():
    """Erstellt Therapieübungen."""
    try:
        if Exercise.objects.exists():
            print("Übungen existieren bereits.")
            return
        
        exercises = [
            {
                'title': 'Achtsamkeitsmeditation',
                'description': 'Eine grundlegende Meditationsübung zur Förderung von Achtsamkeit im Alltag.',
                'type': 'meditation',
                'duration_minutes': 10,
                'points': 15,
                'content': """
# Achtsamkeitsmeditation

## Anleitung

1. Setze dich bequem hin, entweder auf einem Stuhl oder auf dem Boden. Achte darauf, dass dein Rücken gerade ist.
2. Schließe deine Augen oder richte deinen Blick leicht nach unten.
3. Bringe deine Aufmerksamkeit zu deinem Atem. Spüre, wie die Luft ein- und ausströmt.
4. Wenn Gedanken auftauchen, bemerke sie ohne Wertung und kehre sanft zurück zum Atem.
5. Fahre für 10 Minuten fort, indem du deinen Atem beobachtest.
6. Zum Abschluss nimm dir einen Moment Zeit, um die Ruhe zu spüren, bevor du die Augen öffnest.

## Vorteile

- Reduziert Stress und Angstzustände
- Verbessert die Konzentration
- Fördert emotionales Wohlbefinden
- Erhöht die Körperwahrnehmung
"""
            },
            {
                'title': 'Dankbarkeitstagebuch',
                'description': 'Eine Übung zur Steigerung des Wohlbefindens durch das Festhalten positiver Erfahrungen.',
                'type': 'journaling',
                'duration_minutes': 15,
                'points': 10,
                'content': """
# Dankbarkeitstagebuch

## Anleitung

1. Nimm dir 15 Minuten Zeit und finde einen ruhigen Ort.
2. Denke über deinen Tag nach und schreibe mindestens drei Dinge auf, für die du dankbar bist.
3. Beschreibe, warum du für diese Dinge dankbar bist und wie sie dich fühlen lassen.
4. Versuche, jeden Tag neue Dinge zu finden, auch wenn sie noch so klein erscheinen.
5. Lies dir gelegentlich frühere Einträge durch, um zu sehen, was dir wichtig ist.

## Fragen zur Anregung

- Welche Begegnung mit einem Menschen hat dich heute positiv beeinflusst?
- Welchen kleinen Moment der Freude hast du heute erlebt?
- Wofür bist du in Bezug auf deine Gesundheit dankbar?
- Welche Eigenschaft an dir selbst schätzt du besonders?

## Vorteile

- Steigert das allgemeine Wohlbefinden
- Reduziert depressive Symptome
- Verbessert die Schlafqualität
- Erhöht die Resilienz gegenüber Stress
"""
            },
            {
                'title': 'Progressive Muskelentspannung',
                'description': 'Eine Entspannungstechnik, bei der durch bewusstes Anspannen und Entspannen von Muskelgruppen Stress abgebaut wird.',
                'type': 'behavioral',
                'duration_minutes': 20,
                'points': 20,
                'content': """
# Progressive Muskelentspannung (PME)

## Anleitung

1. Setze oder lege dich bequem hin und schließe die Augen.
2. Beginne mit tiefen, langsamen Atemzügen.
3. Spanne nacheinander verschiedene Muskelgruppen für 5-7 Sekunden an und lasse sie dann für 20-30 Sekunden los:
   - Hände und Unterarme: Balle die Fäuste
   - Oberarme: Drücke die Ellbogen gegen den Körper
   - Gesicht: Grimasse ziehen, Augen zusammenkneifen
   - Hals und Nacken: Kopf leicht nach hinten, dann zur Brust
   - Schultern: Schultern zu den Ohren hochziehen
   - Brust und Rücken: Tief einatmen, Brustkorb dehnen
   - Bauch: Bauchmuskulatur anspannen
   - Beine: Füße strecken, dann Fersen in den Boden drücken
4. Spüre den Unterschied zwischen Anspannung und Entspannung.
5. Zum Abschluss nimm dir Zeit, die Entspannung im ganzen Körper zu spüren.

## Vorteile

- Reduziert körperliche Symptome von Stress und Angst
- Verbessert die Körperwahrnehmung
- Hilft bei Schlafstörungen
- Senkt den Blutdruck und die Herzfrequenz
"""
            },
            {
                'title': 'Gedanken hinterfragen',
                'description': 'Eine kognitive Übung zur Identifikation und Umstrukturierung negativer Gedankenmuster.',
                'type': 'cognitive',
                'duration_minutes': 25,
                'points': 25,
                'content': """
# Gedanken hinterfragen

## Anleitung

1. Identifiziere einen negativen Gedanken, der dich belastet.
2. Schreibe diesen Gedanken auf.
3. Beantworte folgende Fragen zu diesem Gedanken:
   - Welche Beweise gibt es für diesen Gedanken?
   - Welche Beweise gibt es gegen diesen Gedanken?
   - Gibt es alternative Erklärungen oder Sichtweisen?
   - Was würde ich einem Freund raten, der diesen Gedanken hätte?
   - Wie wahrscheinlich ist es, dass meine Befürchtung eintritt?
   - Welche Konsequenzen hat es, wenn ich weiterhin so denke?
4. Formuliere einen ausgewogeneren, hilfreichen Gedanken als Alternative.

## Beispiel

- Negativer Gedanke: "Ich werde diese Aufgabe nie schaffen. Ich bin einfach nicht gut genug."
- Ausgewogener Gedanke: "Diese Aufgabe ist herausfordernd, aber ich kann sie in kleinere Schritte unterteilen und mir bei Bedarf Hilfe holen. Ich habe in der Vergangenheit schon schwierige Aufgaben gemeistert."

## Vorteile

- Durchbricht negative Gedankenspiralen
- Fördert eine realistischere Einschätzung von Situationen
- Verbessert die Problemlösungsfähigkeit
- Reduziert Ängste und depressive Symptome
"""
            },
            {
                'title': 'Tiefe Bauchatmung',
                'description': 'Eine einfache aber effektive Atemtechnik zur schnellen Entspannung und Stressreduktion.',
                'type': 'breathwork',
                'duration_minutes': 5,
                'points': 10,
                'content': """
# Tiefe Bauchatmung

## Anleitung

1. Setze dich bequem hin oder lege dich auf den Rücken.
2. Lege eine Hand auf deine Brust und eine auf deinen Bauch.
3. Atme langsam durch die Nase ein und lass deinen Bauch sich ausdehnen (die Hand auf deinem Bauch sollte sich heben).
4. Die Hand auf deiner Brust sollte sich nur wenig bewegen.
5. Atme langsam durch den Mund aus und spüre, wie dein Bauch sich senkt.
6. Wiederhole diese tiefe Atmung für 5 Minuten.

## Atemrhythmus

- Einatmen: Zähle bis 4
- Ausatmen: Zähle bis 6

## Vorteile

- Aktiviert den Parasympathikus (Entspannungsnerv)
- Reduziert Stresshormone im Körper
- Senkt Blutdruck und Herzfrequenz
- Kann in stressigen Situationen überall angewendet werden
"""
            }
        ]
        
        with transaction.atomic():
            for exercise_data in exercises:
                Exercise.objects.create(**exercise_data)
        
        print(f"{len(exercises)} Übungen erstellt.")
    except Exception as e:
        print(f"Fehler beim Erstellen der Übungen: {str(e)}")


def create_daily_prompts():
    """Erstellt tägliche Prompts für eine Woche."""
    try:
        if DailyPrompt.objects.exists():
            print("Tägliche Prompts existieren bereits.")
            return
        
        prompts = [
            {
                'content': 'Welche drei Dinge haben dich heute glücklich gemacht?',
                'type': 'gratitude',
                'date': datetime.date.today()
            },
            {
                'content': 'Was hast du heute gelernt oder welche Erkenntnis hattest du?',
                'type': 'reflection',
                'date': datetime.date.today() - datetime.timedelta(days=1)
            },
            {
                'content': 'Versuche heute, für 10 Minuten ohne Ablenkung in der Natur zu sein.',
                'type': 'challenge',
                'date': datetime.date.today() - datetime.timedelta(days=2)
            },
            {
                'content': 'Nimm beim nächsten Essen alle Sinneseindrücke bewusst wahr.',
                'type': 'mindfulness',
                'date': datetime.date.today() - datetime.timedelta(days=3)
            },
            {
                'content': 'Wofür bist du in deinen Beziehungen dankbar?',
                'type': 'gratitude',
                'date': datetime.date.today() - datetime.timedelta(days=4)
            },
            {
                'content': 'Welche Herausforderung hast du kürzlich gemeistert und was hat dir dabei geholfen?',
                'type': 'reflection',
                'date': datetime.date.today() - datetime.timedelta(days=5)
            },
            {
                'content': 'Kontaktiere heute jemanden, mit dem du lange nicht gesprochen hast.',
                'type': 'challenge',
                'date': datetime.date.today() - datetime.timedelta(days=6)
            },
        ]
        
        with transaction.atomic():
            for prompt_data in prompts:
                DailyPrompt.objects.create(**prompt_data)
        
        print(f"{len(prompts)} Tägliche Prompts erstellt.")
    except Exception as e:
        print(f"Fehler beim Erstellen der täglichen Prompts: {str(e)}")


def create_achievements():
    """Erstellt Achievements für die App."""
    try:
        if Achievement.objects.exists():
            print("Achievements existieren bereits.")
            return
        
        achievements = [
            {
                'title': 'Erste Schritte',
                'description': 'Schließe deine erste Übung ab',
                'icon': '🏆',
                'category': 'milestones',
                'required_value': 1,
                'points': 10
            },
            {
                'title': 'Auf dem Weg',
                'description': 'Schließe 10 Übungen ab',
                'icon': '🚶',
                'category': 'milestones',
                'required_value': 10,
                'points': 25
            },
            {
                'title': 'Meditation-Anfänger',
                'description': 'Führe 5 Meditationsübungen durch',
                'icon': '🧘',
                'category': 'meditation',
                'required_value': 5,
                'points': 25
            },
            {
                'title': 'Meditation-Meister',
                'description': 'Führe 30 Meditationsübungen durch',
                'icon': '✨',
                'category': 'meditation',
                'required_value': 30,
                'points': 100
            },
            {
                'title': 'Journaling-Profi',
                'description': 'Führe 10 Journaling-Übungen durch',
                'icon': '📝',
                'category': 'journaling',
                'required_value': 10,
                'points': 30
            },
            {
                'title': 'Durchhalter',
                'description': 'Erreiche eine Serie von 7 Tagen',
                'icon': '🔥',
                'category': 'streak',
                'required_value': 7,
                'points': 50
            },
            {
                'title': 'Unaufhaltsam',
                'description': 'Erreiche eine Serie von 30 Tagen',
                'icon': '⚡',
                'category': 'streak',
                'required_value': 30,
                'points': 200
            },
            {
                'title': 'Levelaufstieg',
                'description': 'Erreiche Level 5',
                'icon': '⭐',
                'category': 'milestones',
                'required_value': 5,
                'points': 100
            },
        ]
        
        with transaction.atomic():
            for achievement_data in achievements:
                Achievement.objects.create(**achievement_data)
        
        print(f"{len(achievements)} Achievements erstellt.")
    except Exception as e:
        print(f"Fehler beim Erstellen der Achievements: {str(e)}")


def create_breathing_techniques():
    """Erstellt Atemtechniken."""
    try:
        if BreathingTechnique.objects.exists():
            print("Atemtechniken existieren bereits.")
            return
        
        techniques = [
            {
                'name': '4-7-8',
                'description': 'Eine beruhigende Atemtechnik, die hilft, Stress abzubauen und Schlaf zu fördern.',
                'inhale_time': 4,
                'hold_in_time': 7,
                'exhale_time': 8,
                'hold_out_time': 0,
                'cycles': 4,
                'duration': 3,
                'difficulty_level': 'beginner',
                'benefits': 'Reduziert Stress und Angst\nFördert besseren Schlaf\nHilft bei Entspannung'
            },
            {
                'name': 'Box Breathing',
                'description': 'Eine ausgleichende Technik, die von Spezialeinheiten und Athleten genutzt wird, um Ruhe und Fokus zu fördern.',
                'inhale_time': 4,
                'hold_in_time': 4,
                'exhale_time': 4,
                'hold_out_time': 4,
                'cycles': 5,
                'duration': 4,
                'difficulty_level': 'intermediate',
                'benefits': 'Verbessert Konzentration\nReduziert Stress\nSteigert die Leistungsfähigkeit'
            },
            {
                'name': 'Tiefe Bauchatmung',
                'description': 'Eine einfache, entspannende Atemtechnik, die Stress reduziert und den Parasympathikus aktiviert.',
                'inhale_time': 4,
                'hold_in_time': 0,
                'exhale_time': 6,
                'hold_out_time': 2,
                'cycles': 10,
                'duration': 5,
                'difficulty_level': 'beginner',
                'benefits': 'Aktiviert Entspannungsreaktion\nSenkt Blutdruck und Herzfrequenz\nReduziert Stresshormone'
            },
            {
                'name': 'Wim Hof Methode',
                'description': 'Eine intensive Atemtechnik, die das Immunsystem stärken und die mentale Belastbarkeit erhöhen kann.',
                'inhale_time': 2,
                'hold_in_time': 0,
                'exhale_time': 2,
                'hold_out_time': 0,
                'cycles': 30,
                'duration': 7,
                'difficulty_level': 'advanced',
                'benefits': 'Stärkt das Immunsystem\nErhöht die Energie\nVerbessert die Konzentration\nFördert Wohlbefinden'
            },
            {
                'name': 'Alternierende Nasenatmung',
                'description': 'Eine Yoga-Atemtechnik, die das Nervensystem ausgleicht und den Geist beruhigt.',
                'inhale_time': 4,
                'hold_in_time': 4,
                'exhale_time': 4,
                'hold_out_time': 0,
                'cycles': 10,
                'duration': 5,
                'difficulty_level': 'intermediate',
                'benefits': 'Balanciert beide Gehirnhälften\nBeruhigt den Geist\nReduziert Stress und Angst'
            }
        ]
        
        with transaction.atomic():
            # Atemtechniken erstellen
            for technique_data in techniques:
                technique = BreathingTechnique.objects.create(**technique_data)
                
                # Empfehlungen basierend auf der Technik hinzufügen
                if technique.name == '4-7-8':
                    recommendations = [
                        {'condition': 'Stress', 'priority': 1},
                        {'condition': 'Schlaflosigkeit', 'priority': 1},
                        {'condition': 'Angst', 'priority': 2}
                    ]
                elif technique.name == 'Box Breathing':
                    recommendations = [
                        {'condition': 'Konzentration', 'priority': 1},
                        {'condition': 'Leistung', 'priority': 1},
                        {'condition': 'Stress', 'priority': 2}
                    ]
                elif technique.name == 'Tiefe Bauchatmung':
                    recommendations = [
                        {'condition': 'Entspannung', 'priority': 1},
                        {'condition': 'Anfänger', 'priority': 1},
                        {'condition': 'Stress', 'priority': 3}
                    ]
                elif technique.name == 'Wim Hof Methode':
                    recommendations = [
                        {'condition': 'Energie', 'priority': 1},
                        {'condition': 'Leistung', 'priority': 2},
                        {'condition': 'Immunsystem', 'priority': 1}
                    ]
                elif technique.name == 'Alternierende Nasenatmung':
                    recommendations = [
                        {'condition': 'Balance', 'priority': 1},
                        {'condition': 'Konzentration', 'priority': 2},
                        {'condition': 'Entspannung', 'priority': 2}
                    ]
                else:
                    recommendations = []
                
                for rec_data in recommendations:
                    RecommendedTechnique.objects.create(technique=technique, **rec_data)
        
        print(f"{len(techniques)} Atemtechniken erstellt.")
    except Exception as e:
        print(f"Fehler beim Erstellen der Atemtechniken: {str(e)}")


def create_ai_prompts():
    """Erstellt vordefinierte Prompts für den KI-Assistenten."""
    try:
        if AIAssistantPrompt.objects.exists():
            print("KI-Prompts existieren bereits.")
            return
        
        prompts = [
            {
                'title': 'Hilfe bei Angst',
                'prompt': 'Ich fühle mich gerade sehr ängstlich. Kannst du mir Techniken zur Beruhigung vorschlagen?',
                'category': 'mental_health'
            },
            {
                'title': 'Schlafprobleme',
                'prompt': 'Ich habe Probleme einzuschlafen. Welche Entspannungstechniken könnten mir helfen?',
                'category': 'therapy'
            },
            {
                'title': 'Negative Gedanken',
                'prompt': 'Ich habe viele negative Gedanken. Wie kann ich diese umstrukturieren?',
                'category': 'therapy'
            },
            {
                'title': 'Motivation finden',
                'prompt': 'Ich fühle mich unmotiviert und antriebslos. Was kann ich dagegen tun?',
                'category': 'motivation'
            },
            {
                'title': 'Meditation für Anfänger',
                'prompt': 'Ich möchte mit der Meditation beginnen. Kannst du mir eine einfache Anleitung geben?',
                'category': 'meditation'
            },
            {
                'title': 'Stress am Arbeitsplatz',
                'prompt': 'Ich fühle mich an meinem Arbeitsplatz sehr gestresst. Welche Strategien gibt es, um damit umzugehen?',
                'category': 'mental_health'
            },
            {
                'title': 'Umgang mit Konflikten',
                'prompt': 'Ich habe einen Konflikt mit einer nahestehenden Person. Wie kann ich das Gespräch konstruktiv gestalten?',
                'category': 'general'
            },
            {
                'title': 'Selbstwertgefühl stärken',
                'prompt': 'Ich möchte mein Selbstwertgefühl verbessern. Welche Übungen können mir dabei helfen?',
                'category': 'therapy'
            }
        ]
        
        with transaction.atomic():
            for prompt_data in prompts:
                AIAssistantPrompt.objects.create(**prompt_data)
        
        print(f"{len(prompts)} KI-Prompts erstellt.")
    except Exception as e:
        print(f"Fehler beim Erstellen der KI-Prompts: {str(e)}")


if __name__ == '__main__':
    print("Starte Datenmigrationsskript...")
    
    create_superuser()
    create_exercises()
    create_daily_prompts()
    create_achievements()
    create_breathing_techniques()
    create_ai_prompts()
    
    print("Datenmigrationsskript abgeschlossen!")