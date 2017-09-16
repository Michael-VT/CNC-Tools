# CNC-Tools
## Tools for generet G-code by parametr
Программа Tools прилагается с исходными файлами на Delphi 6.0.
Программа по заданным параметрам выдаёт G-code для станка с ЧПУ.
Возможны варианты выборки прямоугольной ниши или 
вырезания прямоугольника по контуру.
Программа не отслеживает ошибки и краевые условия и может из за них слетать.
---

Результат выводится в нижнем левом окне, откуда его можно скопировать,
например файл для дальнейшего использования в программе станка.

В комплекте лежит и исполняемый	файл и исходники программы.
---

## Краткое описание работы программы.
---
### Задаваемые параметры в панели программы

**Диаметр фрезы** - это задаётся диаметр режущего инструмента-фрезы.

**Глубина выборки** - глубина общей выборки в заготовке, задаёт общую глубину выборки.

**Шаг выборк** - это шаг смещения инструмента по X или Y в зависимости от
             выбранной ориентации выполнения выборки

**Разовое заглубление** - это глубина на которую погружается инструмент
                      для фрезерования следующего слоя заготовки.
					  
**Скорость фрезеровки** - задается скорость фрезеровки по координатам,
                      опрделяет скорость передвижения фрезы в заготовки
					  во время резания.

**Старт X, Y** - задаёт начальное смещение для области выборки.

**Длина по X, Y** - эро расстояние, на которое будет выполняться выборка.

**Авто X или Y** - галочка включает режим автоматического выбора преобладающего
               направления выборки при фрезеровании.

**направление X или Y** - с галочкой преобладание выборки по X
                      без галочки преобладание выборки по Y.

**Засверливать углы** - если стоит галочка, то по завершению выборки фреза
                    засверливает за один проход выборки углы.

**Включить выборку** - если стоит галочка, то выполняется выборка внутри
                   прямоугольника, иначе просто вырезается прямоугольник по контуру.

**Контур** - установленная галочка приводит к финальному фрезерованию контура для более
         чистой обработки. Если не устанавливать галочку, то выполняется только выборку.
		 Если нет галочки и не стоит галочка на Включить выборку, то ничего не обрабатывается

**Выводить инструмент перед заглублением** - после завершения одного слоя выборки инструмент
                                         выводится из заготовки перед следующей обработкой.

**Предпросмотр** - нажатие на кнопку выполняет обработку данных и создает набор
               команд G-code для обработки.

**Шестигранник** - если установлена галочка, то выборка идёт как для шестигранника.

**Анимация** - если стоит галочка, то по завершению подготовки команд медленно
           прорисовывается процесс обработки.
           Интервал между линиями в миллисекундах задается ниже.

**Скорость анимации мсек** - это задается время в миллисекундах, при анимации
                         задержка между рисованиями каждой из команд.

