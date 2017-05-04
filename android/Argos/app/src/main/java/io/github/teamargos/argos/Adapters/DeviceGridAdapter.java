package io.github.teamargos.argos.Adapters;

import android.content.Context;
import android.graphics.Color;
import android.graphics.PorterDuff;
import android.graphics.PorterDuffColorFilter;
import android.graphics.drawable.Drawable;
import android.support.v4.content.ContextCompat;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.TextView;

import java.util.List;

import io.github.teamargos.argos.Models.Device;
import io.github.teamargos.argos.R;
import io.github.teamargos.argos.Views.DeviceTileView;

/**
 * Created by jordan on 4/11/17.
 */

public class DeviceGridAdapter extends BaseAdapter {
    private Context context;
    private List<Device> devices;
    private static String TAG = DeviceGridAdapter.class.getName();

    public DeviceGridAdapter(Context c, List<Device> devices) {
        this.context = c;
        this.devices = devices;
    }

    @Override
    public int getCount() {
        return devices.size();
    }

    public Object getItem(int position) {
        return this.devices.get(position);
    }

    public long getItemId(int position) {
        return 0;
    }

    public View getView(int position, View convertView, ViewGroup parent) {
        DeviceTileView deviceView;

        if (convertView == null) {
            deviceView = new DeviceTileView(this.context);
        } else {
            deviceView = (DeviceTileView) convertView;
        }
        Device device = this.devices.get(position);
        TextView name = (TextView) deviceView.findViewById(R.id.device_name);
        TextView stateTv = (TextView) deviceView.findViewById(R.id.state);
        name.setText(device.name);
        Drawable d = ContextCompat.getDrawable(this.context, R.drawable.device_tile);
        int color = context.getResources().getColor(R.color.colorDeviceTileOff);
        if (device.state.reachable && device.state.on) {
            color = context.getResources().getColor(R.color.colorDeviceTileOn);
            stateTv.setText("ON");
        } else if (!device.state.reachable) {
            stateTv.setText("unreachable");
        } else {
            stateTv.setText("OFF");
        }

        PorterDuffColorFilter cf = new PorterDuffColorFilter(color, PorterDuff.Mode.MULTIPLY);
        d.setColorFilter(cf);

        deviceView.setBackground(d);
        return deviceView;
    }
}
