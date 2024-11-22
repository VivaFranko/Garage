import csv
import os
import json
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from io import BytesIO
from docxtpl import DocxTemplate
from pathlib import Path

@csrf_exempt
def search_applicant(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        applicant_name = data.get('applicant_name', '').lower()

        results = []
        with open(settings.CSV_FILE_PATH, mode='r', encoding='utf-8-sig') as file:
            csv_reader = csv.DictReader(file, delimiter=';')
            for row in csv_reader:
                if 'Вступник' in row and applicant_name == row['Вступник'].lower():
                    row['status'] = row.get('Статус Заявки', '').strip()
                    results.append(row)

        if results:
            return JsonResponse({'results': results})
        else:
            return JsonResponse({'error': 'Вступника не знайдено'}, status=404)

    return JsonResponse({'error': 'Некоректний запит'}, status=400)

@csrf_exempt
def generate_word_file(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            template_name = data.get('template', 'template')
            template_path = Path(settings.BASE_DIR) / f'{template_name}.docx'

            # Завантаження шаблону
            try:
                doc = DocxTemplate(template_path)
            except FileNotFoundError:
                return JsonResponse({'error': 'Шаблон Word не знайдено'}, status=500)
            except Exception as e:
                return JsonResponse({'error': f'Помилка під час завантаження шаблону: {str(e)}'}, status=500)

            context = {
                'ПІБ_Вступник': data['passportDetails']['fullName'],
                'серія_паспорт': data['passportDetails']['passportSeries'],
                'номер_паспорт': data['passportDetails']['passportNumber'],
                'ким_паспорт': data['passportDetails']['passportWho'],
                'коли_паспорт': data['passportDetails']['passportWhen'],
                'адреса': data['passportDetails']['address'],
                'рнокпп': data['passportDetails']['RNOKPP'],
                'номер': data['passportDetails']['phoneNumber'],
                'ПІБ_представник': data['passportDetails']['fullName2'],
                'серія_паспорт_представник': data['passportDetails']['passportSeries2'],
                'номер_паспорт_представник': data['passportDetails']['passportNumber2'],
                'ким_паспорт_представник': data['passportDetails']['passportWho2'],
                'коли_паспорт_представник': data['passportDetails']['passportWhen2'],
                'адреса_представник': data['passportDetails']['address2'],
                'рнокпп_представник': data['passportDetails']['RNOKPP2'],
                'номер_представник': data['passportDetails']['phoneNumber2'],
                'дата_навчання': data['Дата угоди про Навчання'],
                'форма_навчання': data['Форма навчання'],
                'освітні_програми': data['Освітні програми'],
                'спеціальність': data['Шифр і назва спеціальності'],
                'спеціалізація': data['Спеціалізація'],
                'cтруктурний_підрозділ': data['Структурний підрозділ'],
                'ОКР': data['ОКР'],
                'акдеритація': data['Чи акредитовано ОП'],
                'фінансування': data['Джерело фінансування'],
                'посада': data['Посада'],
                'керівник': data['Керівник'],
                'кредити': data['Кредитів ECTS'],
                'вартість_рік': data['Вартість одного року навчання, грн'],
                'вартість_рік_пропис': data['Вартість одного року навчання, грн (Прописом)'],
                'вартість_семестр': data['Вартість одного семестру навчання, грн'],
                'вартість_семестр_пропис': data['Вартість одного семестру навчання, грн (Прописом)'],
                'вартість_загалом': data['Вартість навчання за весь період, грн'],
                'вартість_загалом_пропис': data['Вартість навчання за весь період, грн (Прописом)'],
                'дата_платна': data['Дата договору про платну ОП'],
                'дата_cеместр': data['Дата сплати за перший семестр'],
                'дата_послуга': data['Термін навчання'],
                'дата_акредитація': data['Акредитація.Термін дії сертифікату'],
            }

            doc.render(context)

            # Створення документа в пам'яті
            output_stream = BytesIO()
            doc.save(output_stream)
            output_stream.seek(0)

            # Відправка файлу на фронт
            response = HttpResponse(
                output_stream.read(),
                content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
            response['Content-Disposition'] = f'attachment; filename="{data["passportDetails"]["fullName"]}_template.docx"'
            return response

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Некоректний формат JSON'}, status=400)
        except KeyError as e:
            return JsonResponse({'error': f'Відсутнє обов’язкове поле: {str(e)}'}, status=400)
        except Exception as e:
            return JsonResponse({'error': f'Невідома помилка: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Некоректний запит'}, status=400)
