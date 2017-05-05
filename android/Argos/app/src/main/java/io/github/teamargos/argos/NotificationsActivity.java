package io.github.teamargos.argos;

import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.support.v4.widget.CursorAdapter;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ListView;
import android.widget.TextView;

public class NotificationsActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_notifications);

        SQLiteDatabase notDatabase = openOrCreateDatabase("notifications",MODE_PRIVATE,null);
        Cursor results = notDatabase.query(
                "Notification",
                new String[] {"DeviceName", "DeviceId", "FulcrumId", "DesiredState"},
                null,
                null,
                null,
                null,
                null);

        ListView ls = (ListView) findViewById(R.id.not_list);

        NotCursorAdapter notCursorAdapter = new NotCursorAdapter(this, results);
        ls.setAdapter(notCursorAdapter);
    }

    public class NotCursorAdapter extends CursorAdapter {
        public NotCursorAdapter(Context context, Cursor cursor) {
            super(context, cursor, 0);
        }

        // The newView method is used to inflate a new view and return it,
        // you don't bind any data to the view at this point.
        @Override
        public View newView(Context context, Cursor cursor, ViewGroup parent) {
            return LayoutInflater.from(context).inflate(R.layout.item_notification, parent, false);
        }

        // The bindView method is used to bind all data to a given view
        // such as setting the text on a TextView.
        @Override
        public void bindView(View view, Context context, Cursor cursor) {
            // Find fields to populate in inflated template
            TextView name = (TextView) view.findViewById(R.id.device_name);
            TextView state = (TextView) view.findViewById(R.id.desired_state);

            // Extract properties from cursor
            String body = cursor.getString(cursor.getColumnIndexOrThrow("DeviceName"));
            int priority = cursor.getInt(cursor.getColumnIndexOrThrow("DesiredState"));

            // Populate fields with extracted properties
            name.setText(body);
            state.setText(String.valueOf(priority));
        }
    }
}
