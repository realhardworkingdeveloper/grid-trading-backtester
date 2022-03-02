from flask import *  
  
app = Flask(__name__) #creating the Flask class object   
 
@app.route('/')
def home():  
    return render_template('home.html')

@app.route('/report')
def report():  
    return render_template('report.html')
  
if __name__ =='__main__':  
    app.run(debug = True)  