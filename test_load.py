import joblib

try:
    obj = joblib.load("artifacts_v2.pkl")
    print("SUCCESS")
    print(type(obj))

    if isinstance(obj, dict):
        print("Keys:", obj.keys())

except Exception as e:
    print("ERROR:")
    print(type(e))
    print(e)