package io.github.teamargos.argos;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.google.gson.Gson;

import java.util.HashMap;
import java.util.Map;

import io.github.teamargos.argos.Models.DeviceStateChange;
import io.github.teamargos.argos.Models.StateChangeResponse;
import io.github.teamargos.argos.Utils.HttpUtils;

public class HuePairActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_hue_pair);

        Button pairButton = (Button) findViewById(R.id.pair_hue_button);

        pairButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Button button = (Button) v;
                button.setText("Pairing Hue Lightbridge");

                Intent dashboard = new Intent(v.getContext(), DashboardActivity.class);
                v.getContext().startActivity(dashboard);
            }
        });
    }
}
