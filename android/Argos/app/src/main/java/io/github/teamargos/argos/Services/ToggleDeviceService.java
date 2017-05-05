package io.github.teamargos.argos.Services;

import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.os.IBinder;
import android.util.Log;

import com.google.gson.Gson;

import java.util.HashMap;
import java.util.Map;

import io.github.teamargos.argos.Models.Device;
import io.github.teamargos.argos.Models.DeviceStateChange;
import io.github.teamargos.argos.Models.StateChangeResponse;
import io.github.teamargos.argos.R;
import io.github.teamargos.argos.Utils.HttpUtils;

/**
 * Created by alexb on 5/4/2017.
 */

public class ToggleDeviceService extends Service {
    private String TAG = "TOGGLE_SERVICE";
    private int NOT_ID = 1;

    public IBinder onBind(Intent intent) {
        return null;
    }

    public int onStartCommand(Intent intent, int flags, int startId) {
        ToggleDeviceTask task = new ToggleDeviceTask();
        task.execute(intent);

        NotificationManager notMan = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        notMan.cancel(NOT_ID);

        return START_STICKY;
    }

    private class ToggleDeviceTask extends AsyncTask<Intent, Integer, String> {
        private SharedPreferences prefs;
        private Device device;

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            this.prefs = getSharedPreferences(getString(R.string.user_id), 0);
        }

        protected String doInBackground(Intent... params) {
            Intent intent = params[0];
            int desiredState = intent.getIntExtra("desiredState", 0);
            boolean shouldBeOn = desiredState == 1;

            String deviceId = intent.getStringExtra("deviceId");
            String fulcrumId = intent.getStringExtra("fulcrumId");
            Log.d(TAG, "doInBackground: " + fulcrumId);

            String url = getString(R.string.api_base_url) + "set_state/" + fulcrumId + "/" + deviceId;

            Map<String, String> body = new HashMap<String, String>();
            body.put("on", Boolean.toString(shouldBeOn));
            String bodyString = new Gson().toJson(body);

            return HttpUtils.post(url, bodyString, null);
        }

        protected void onPostExecute(String data) {

        }
    }
}
