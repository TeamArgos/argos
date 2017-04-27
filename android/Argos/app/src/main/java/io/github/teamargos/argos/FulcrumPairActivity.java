package io.github.teamargos.argos;

import android.Manifest;
import android.annotation.TargetApi;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanRecord;
import android.bluetooth.le.ScanResult;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.os.ParcelUuid;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ListView;

import com.google.gson.Gson;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import io.github.teamargos.argos.Adapters.FulcrumListAdapter;
import io.github.teamargos.argos.Models.DeviceStateChange;
import io.github.teamargos.argos.Models.Fulcrum;
import io.github.teamargos.argos.Models.StateChangeResponse;
import io.github.teamargos.argos.Utils.HttpUtils;

public class FulcrumPairActivity extends AppCompatActivity {
    private static final String TAG = "FulcrumPairActivity";
    private static final int START_BT = 2;

    private BluetoothAdapter btAdapter;
    private BluetoothLeScanner scanner;
    private Set<Fulcrum> foundIds;
    private ListView lvFulcrums;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_fulcrum_pair);
        lvFulcrums = (ListView) findViewById(R.id.lvFulcrums);
        lvFulcrums.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Fulcrum f = (Fulcrum) lvFulcrums.getAdapter().getItem(position);
                PairFulcrumTask task = new PairFulcrumTask();
                task.execute(f.id);
            }
        });

        foundIds = new HashSet<>();
        final BluetoothManager btMgr =
                (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        btAdapter = btMgr.getAdapter();
        if (btAdapter.isEnabled()) {
            initBt();
        } else {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, START_BT);
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        switch (requestCode) {
            case START_BT:
                initBt();
                break;
            default:
                break;
        }
    }

    private void initBt() {
        if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            permissions();
        } else {
            scan(true);
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        scanner.stopScan(callback);
    }

    /**
     * Starts bluetooth scan
     * @param enable
     */
    private void scan(final boolean enable) {
        scanner = btAdapter.getBluetoothLeScanner();
        scanner.startScan(callback);
    }

    /**
     * Displays fulcrums that has been found by the scan
     */
    private void displayFulcrums() {
        List<Fulcrum> lst = new ArrayList<>(foundIds);
        FulcrumListAdapter adapter = new FulcrumListAdapter(this, lst);
        lvFulcrums.setAdapter(adapter);
    }

    /**
     * Asks for location permissions from user.
     */
    @TargetApi(23)
    private void permissions() {
        requestPermissions(new String[]{Manifest.permission.ACCESS_COARSE_LOCATION}, 1);
    }

    /**
     * After permissions have been granted, starts scan
     * @param requestCode
     * @param permissions
     * @param grantResults
     */
    @Override
    public void onRequestPermissionsResult(int requestCode, String permissions[],int[] grantResults) {
        scan(true);
    }

    /**
     * A callback that is called at scan events
     */
    private ScanCallback callback = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            super.onScanResult(callbackType, result);
            ScanRecord rec = result.getScanRecord();
            if (rec != null && rec.getServiceUuids() != null) {
                List<ParcelUuid> serviceIds = rec.getServiceUuids();
                int cutoff = 4;
                StringBuilder sb = new StringBuilder();
                String[] argosIds = new String[]{"6172", "676f", "7363", "6170"};
                for (int i = 0; i < serviceIds.size(); i++) {
                    ParcelUuid uuid = serviceIds.get(i);
                    String quad = uuid.getUuid().toString().substring(4, 8);

                    // Check that beacon matches the argos beacon UUID
                    if (i < cutoff) {
                        if (!quad.equals(argosIds[i])) break;
                    } else {
                        sb.append(quad);
                    }
                }
                Fulcrum f = new Fulcrum();
                f.id = sb.toString();
                foundIds.add(f);
                displayFulcrums();
            }
        }

        @Override
        public void onBatchScanResults(List<ScanResult> results) {
            super.onBatchScanResults(results);
        }

        @Override
        public void onScanFailed(int errorCode) {
                                              super.onScanFailed(errorCode);
                                                                            }
    };


    private class PairFulcrumTask extends AsyncTask<String, String, String> {
        private SharedPreferences prefs;

        @Override
        protected void onPreExecute() {
            super.onPreExecute();
            this.prefs = getSharedPreferences(getString(R.string.user_id), 0);
        }

        protected String doInBackground(String... params) {
            String fulcrumId = params[0];
            String uid = prefs.getString("user_id", "");
            String urlString = getString(R.string.api_base_url) + "map_fulcrum";
            Map<String, String> body = new HashMap<>();
            body.put("fulcrumId", fulcrumId);
            body.put("uid", uid);
            String bodyString = new Gson().toJson(body);
            return HttpUtils.post(urlString, bodyString, null);
        }

        protected void onPostExecute(String data) {
            Log.i(TAG, "Done pairing");
            finish();
        }
    }
}
