package com.cryptowatch.backend.util;

import java.util.Date;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

public final class DateUtils {

    private DateUtils() {}

    public static Date atUtcDayStart(Date date) {
        if (date == null) return null;
        LocalDate localDate = date.toInstant().atOffset(ZoneOffset.UTC).toLocalDate();
        return Date.from(localDate.atStartOfDay(ZoneOffset.UTC).toInstant());
    }

    public static Date atUtcDayEnd(Date date) {
        if (date == null) return null;
        LocalDate localDate = date.toInstant().atOffset(ZoneOffset.UTC).toLocalDate();
        return Date.from(localDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).minusNanos(1).toInstant());
    }
}