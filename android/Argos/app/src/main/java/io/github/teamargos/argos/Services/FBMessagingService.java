package io.github.teamargos.argos.Services;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.database.sqlite.SQLiteDatabase;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

import io.github.teamargos.argos.LoginActivity;
import io.github.teamargos.argos.R;

/**
 * Created by alexb on 5/4/2017.
 */

public class FBMessagingService extends FirebaseMessagingService {
    private String TAG = "FB_MESSAGING";
    private int NOT_ID = 1;

    @Override
    public void onMessageReceived(RemoteMessage rm) {
        Log.d(TAG, "Message Recieved");

        // Get Data
        Map<String, String> data = rm.getData();

        String deviceId = data.get("deviceId");
        String fulcrumId = data.get("fulcrumId");
        String deviceName = data.get("deviceName");
        Integer desiredState = Integer.parseInt(data.get("desiredState"));

        // Set up text
        String curState = "";
        String desState = "";
        if (desiredState == 0) {
           curState = "on";
            desState = "off";
        } else {
            curState = "off";
            desState = "on";
        }

        String title = deviceName + " is " + curState;
        String text = deviceName + " was left " + curState + ". Normally it is " + desState + " at this time.";

        // Build Basic notification
        NotificationCompat.Builder notBuilder = new NotificationCompat.Builder(this)
                .setSmallIcon(R.mipmap.ic_launcher_round)
                .setContentTitle(title)
                .setContentText(text);



        // Open app intent
        Intent resultIntent = new Intent(this, LoginActivity.class);
        PendingIntent pi = PendingIntent.getActivity(
                this,
                0,
                resultIntent,
                PendingIntent.FLAG_UPDATE_CURRENT
        );

        notBuilder.setContentIntent(pi);

        // Action Intents
        Intent toggleIntent = new Intent(this, ToggleDeviceService.class);
        toggleIntent.putExtra("deviceId", deviceId);
        toggleIntent.putExtra("desiredState", desiredState);
        toggleIntent.putExtra("fulcrumId", fulcrumId);
        PendingIntent togglePending = PendingIntent.getService(
                this,
                0,
                toggleIntent,
                PendingIntent.FLAG_UPDATE_CURRENT
        );

        // Add Actions
        notBuilder.addAction(R.mipmap.ic_launcher_round, "Turn " + desState, togglePending);
        notBuilder.addAction(R.mipmap.ic_launcher_round, "Ignore", pi);

        Notification not = notBuilder.build();

        // Set up notification defaults
        not.defaults |= Notification.DEFAULT_VIBRATE;
        not.defaults |= Notification.DEFAULT_SOUND;

        not.flags = Notification.FLAG_AUTO_CANCEL;

        NotificationManager notMan = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        notMan.notify(NOT_ID, not);


        // Save notification for future uses
        SQLiteDatabase notDatabase = openOrCreateDatabase("notifications",MODE_PRIVATE,null);
        notDatabase.execSQL("CREATE TABLE IF NOT EXISTS Notification(_id INTEGER PRIMARY KEY, DeviceName VARCHAR, DeviceId VARCHAR, FulcrumId VARCHAR, DesiredState INTEGER);");
        notDatabase.execSQL("INSERT INTO Notification VALUES('" + deviceName +"','" + deviceId + "', '" + fulcrumId + "', '" + desiredState + "');");
    }
}
