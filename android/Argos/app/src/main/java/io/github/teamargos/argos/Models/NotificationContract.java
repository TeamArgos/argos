package io.github.teamargos.argos.Models;

import android.provider.BaseColumns;

/**
 * Created by alexb on 5/5/2017.
 */

public class NotificationContract {
    private NotificationContract() {}

    /* Inner class that defines the table contents */
    public static class FeedEntry implements BaseColumns {
        public static final String TABLE_NAME = "entry";
        public static final String COLUMN_NAME_DEVICENAME = "DeviceName";
        public static final String COLUMN_NAME_DEVICEID = "DeviceId";
        public static final String COLUMN_NAME_FULCRUMID = "FulcrumId";
        public static final String COLUMN_NAME_DESIREDSTATE = "DesiredState";
    }
}
