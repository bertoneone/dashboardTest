from flask import Flask, render_template, request, redirect
from pandas import read_csv

columns = ['date', 'prodPow', 'consPow', 'toGridPow', 'fromGridPow', 'prodEn', 'consEn', 'toGridEn', 'fromGridEn']


dashboard = Flask(__name__)


# Dashboard homepage. Default port is 5000 at localhost
@dashboard.route('/')
def home():
    debug = True if request.args.get('debug', default='false') == 'true' else False
    return render_template('index.html', debug=debug)


# Data page for loading charts
@dashboard.route('/data')
def get_data():
    df = read_csv('./static/data/data.csv', sep=';', usecols=range(9), parse_dates=[0], infer_datetime_format=True, index_col=[0])
    # Rename all columns
    df.index.name = columns[0]
    df.columns = columns[1:]
    # Return json format for easy parsing
    return df.reset_index().to_json(orient='records')


# First run it, then you can connect! Adding host=0.0.0.0 makes it visible within your local network.
if __name__ == '__main__':
    dashboard.run(host='0.0.0.0', debug=True)
