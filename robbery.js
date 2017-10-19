'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */
exports.isStar = false;

/**
 * Перевод дня недели в количество минут с начала недели
 * @param {String} DD - День недели: ПН, ВТ или СР
 * @returns {Number} Количество минут
 */
function dayToMinutes(DD) {
    switch (DD) {
        case 'ПН': return 0;
        case 'ВТ': return 1440;
        case 'СР': return 2880;
        default: return 0;
    }
}

/**
 * Парсинг даты и времени у людей
 * @param {String} S - строка взятая из from или to
 * @returns {Object} - (DD, HH, MM, belt)
 */
function parseLine(S) {
    let splitedBySpace = S.split(' ');
    let timeAndBelt = splitedBySpace[1].split('+');
    let DD = splitedBySpace[0];
    let HH = Number(timeAndBelt[0].split(':')[0]);
    let MM = Number(timeAndBelt[0].split(':')[1]);
    let timeBelt = Number(timeAndBelt[1]);

    return { DD, HH, MM, timeBelt };
}

/**
 * Парсинг входных данных о времени работы банка
 * @param {Object} workingHours – Время работы банка
 * @returns {Object} (fromHH, fromMM, toHH, toMM, belt)
 */
function getBankTimeAndBelt(workingHours) {
    let parseFrom = workingHours.from.split('+');
    let timeBelt = Number(parseFrom[1]);
    let fromHH = Number(parseFrom[0].split(':')[0]);
    let fromMM = Number(parseFrom[0].split(':')[1]);
    let parseTo = workingHours.to.split('+');
    let toHH = Number(parseTo[0].split(':')[0]);
    let toMM = Number(parseTo[0].split(':')[1]);

    return { fromHH, fromMM, toHH, toMM, timeBelt };
}

/**
 * Перевод занятого времени человека в числовые интервалы
 * @param {Object} Name - имя человека
 * @param {String} Name.from - строка времени "от"
 * @param {String} Name.to - строка врмени "до"
 * @param {Number} bankBelt - временной пояс банка
 * @returns {Object} {[a,b], [c,d].....}
 */
function toNumberInterval(Name, bankBelt) {
    let numberIntervals = [];
    for (let i = 0; i < Name.length; i++) {
        let from = parseLine(Name[i].from);
        let to = parseLine(Name[i].to);
        let fromDD = dayToMinutes(from[0]);
        let toDD = dayToMinutes(to[0]);
        let fromHH = from[1];
        let fromMM = from[2];
        let toHH = to[1];
        let toMM = to[2];
        let timeBelt = to[3];
        let intervalBegin = fromDD + 60 * (fromHH + (bankBelt - timeBelt)) + fromMM;
        let intervalEnd = toDD + 60 * (toHH + (bankBelt - timeBelt)) + toMM;
        numberIntervals.push([intervalBegin, intervalEnd]);
    }


    return numberIntervals;
}

/**
 * Перевод из занятого времени в свободное
 * @param {Object} numberIntervals - Интервалы времен, когда люди заняты
 * @returns {Object} Интервалы времен, когда люди свободны
 */
function timeFromBusyToFree(numberIntervals) {
    let n = numberIntervals.length;
    let numberIntervalsCopy = [];
    numberIntervalsCopy.push([0, numberIntervals[0][0]]);
    for (let i = 1; i < n - 1; i++) {
        numberIntervalsCopy.push([numberIntervals[i - 1][1], numberIntervals[i][0]]);
    }
    numberIntervalsCopy.push([numberIntervals[n - 1][1], 4320]);

    return numberIntervalsCopy;
}

/**
 * Перевод времени работы банка в числовые интервалы для каждого дня (ПН, ВТ, СР)
 * @param {Object} workingHours - время работы банка
 * @returns {Object} {[a,b], [c,d], [e,f]} в минутах
 */

function toNumberIntervalBank(workingHours) {
    let parse = getBankTimeAndBelt(workingHours);
    let numberIntervalsBank = [];
    let intervalBegin = parse[0] * 60 + parse[1];
    let intervalEnd = parse[2] * 60 + parse[3];
    let multiplier = 1440; // 60 * 24 - Число минут в одном дне
    for (let i = 0; i < 3; i++) {
        numberIntervalsBank.push([intervalBegin + i * multiplier, intervalEnd + i * multiplier]);
    }

    return numberIntervalsBank;
}

/**
 * Определение дня по числу минут с начала недели
 * @param {Number} number - Число минут с начала недеи
 * @returns {Object}
 */
function minutesToDayAndTime(number) {
    let dev = Math.floor(number / 1440);
    let DD;
    switch (dev) {
        case 0: DD = 'ПН';
            break;
        case 1: DD = 'ВТ';
            break;
        case 2: DD = 'СР';
            break;
        default: DD = [''];
    }
    let rest = number % 1440;
    let MM = rest % 60;
    let HH = (rest - MM) / 60;
    if (HH < 10) {
        HH = '0' + toString(HH);
    }
    if (MM < 10) {
        MM = '0' + toString(MM);
    }

    return { DD, HH, MM };
}

/**
 * Возврат пересечения числовых множеств
 * @param {Array} M1 - первый набор множеств
 * @param {Array} M2 - второй набор множеств
 * @returns {Array} - результат операции пересечения множеств M1 и M2
 */
function intersectionOfSets(M1, M2) {
    let n1 = M1.length;
    let n2 = M2.length;
    let resultSet = [];
    for (let m1 = 0; m1 <= n1 - 1; m1++) {
        for (let m2 = 0; m2 <= n2 - 1; m2++) {
            let edgeRight = min((M1[m1][1]), M2[m2][1]);
            let edgeLeft = max(M1[m1][0], M2[m2][0]);
            resultSet.push([edgeLeft, edgeRight]);
        }
    }

    return resultSet;
}

/**
 * Проверка на неправильные интервалы и их удаление
 * @param {Object} resultSet результат пересечения
 * @returns {Object}
 */
function checkAndFix(resultSet) {
    let n = resultSet.length;
    let resultSetFixed = [];
    for (let i = 0; i < n; i++) {
        if (resultSet[i][1] - resultSet[i][0] <= 0) {
            continue;
        }
        resultSetFixed.push(resultSet[i]);
    }

    return resultSetFixed;
}

/**
 * Максимум из двух чисел
 * @param {Number} a - число
 * @param {Number} b - число
 * @returns {Number}  max(a,b)
 */
function max(a, b) {
    let c = (a >= b) ? a : b;

    return c;
}

/**
 * Минимум из двух чисел
 * @param {Number} a - число
 * @param {Number} b - число
 * @returns {Number}  min(a,b)
 */
function min(a, b) {
    let c = (a <= b) ? a : b;

    return c;
}

/**
 * Найти подходящие интервалы
 * @param {Nubmer} time - время на ограбление
 * @param {Object} resultIntervals - интервал времен, полученный пересечением
 * @returns {Object} подходящие интервалы
 */
function checkForMoment(time, resultIntervals) {
    let goodIntervals = [];
    for (let i = 0; i < resultIntervals.length - 1; i++) {
        if (time <= resultIntervals[i][1] - resultIntervals[i][0]) {
            goodIntervals.push(resultIntervals[i]);
        }
    }

    return goodIntervals;
}

/**
 * @param {Object} schedule – Расписание Банды
 * @param {Number} duration - Время на ограбление в минутах
 * @param {Object} workingHours – Время работы банка
 * @param {String} workingHours.from – Время открытия, например, "10:00+5"
 * @param {String} workingHours.to – Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
exports.getAppropriateMoment = function (schedule, duration, workingHours) {
    console.info(schedule, duration, workingHours);
    let bankBelt = getBankTimeAndBelt(workingHours)[4];
    let intervalBank = toNumberIntervalBank(workingHours);
    let dannyFreeTime = timeFromBusyToFree(toNumberInterval(schedule.Danny, bankBelt));
    let rustyFreeTime = timeFromBusyToFree(toNumberInterval(schedule.Rusty, bankBelt));
    let linusFreeTime = timeFromBusyToFree(toNumberInterval(schedule.Linus, bankBelt));
    let result = intersectionOfSets(intervalBank, dannyFreeTime);
    result = checkAndFix(result);
    result = intersectionOfSets(result, rustyFreeTime);
    result = checkAndFix(result);
    result = intersectionOfSets(result, linusFreeTime);
    result = checkAndFix(result);
    result = checkForMoment(duration, result);

    return {

        /**
         * Найдено ли время
         * @returns {Boolean}
         */
        exists: function () {
            if (result === []) {

                return false;
            }

            return true;
        },

        /**
         * Возвращает отформатированную строку с часами для ограбления
         * Например,
         *   "Начинаем в %HH:%MM (%DD)" -> "Начинаем в 14:59 (СР)"
         * @param {String} template
         * @returns {String}
         */
        format: function (template) {
            if (!this.exists()) {
                return '';
            }
            let number = result[0][0];
            let DD = minutesToDayAndTime(number)[0];
            let HH = minutesToDayAndTime(number)[1];
            let MM = minutesToDayAndTime(number)[2];

            return template
                .replace(/%DD/, DD)
                .replace(/%HH/, HH)
                .replace(/%MM/, MM);
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @star
         * @returns {Boolean}
         */
        tryLater: function () {
            return false;
        }
    };
};
