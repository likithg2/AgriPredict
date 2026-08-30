import sys
import json
import traceback

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided."}))
        sys.exit(1)

    image_path = sys.argv[1]
    
    try:
        from quality_predictor import predict_quality
        with open(image_path, "rb") as f:
            crop_name, quality, confidence, fresh_pct, rotten_pct = predict_quality(f)
            
        print(json.dumps({
            "crop_name": crop_name,
            "quality": quality,
            "confidence": confidence,
            "fresh_pct": fresh_pct,
            "rotten_pct": rotten_pct
        }))
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "traceback": traceback.format_exc()
        }))

if __name__ == "__main__":
    main()
