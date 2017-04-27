package io.github.teamargos.argos.Adapters;

import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ListView;
import android.widget.TextView;

import java.util.List;

import io.github.teamargos.argos.Models.Fulcrum;
import io.github.teamargos.argos.R;
import io.github.teamargos.argos.Views.FulcrumListItem;

/**
 * Created by jordan on 4/26/17.
 */

public class FulcrumListAdapter extends BaseAdapter {
    private Context context;
    private List<Fulcrum> fulcrumList;

    public FulcrumListAdapter(Context c, List<Fulcrum> fulcrumList) {
        this.context = c;
        this.fulcrumList = fulcrumList;
    }

    @Override
    public int getCount() {
        return this.fulcrumList.size();
    }

    public Object getItem(int position) {
        return this.fulcrumList.get(position);
    }

    public long getItemId(int position) {
        return 0;
    }

    public View getView(int position, View convertView, ViewGroup parent) {
        FulcrumListItem item;

        if (convertView == null) {
            item = new FulcrumListItem(this.context);
        } else {
            item = (FulcrumListItem) convertView;
        }

        Fulcrum f = this.fulcrumList.get(position);
        TextView id = (TextView) item.findViewById(R.id.fulcrum_id);
        id.setText(f.id);

        return item;
    }
}
