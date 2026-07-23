import os
import pydicom
import numpy as np
from PIL import Image
import argparse

def dicom_to_png(input_folder, output_folder):
    os.makedirs(output_folder, exist_ok=True)

    for filename in os.listdir(input_folder):
        if filename.lower().endswith(".dcm"):
            dicom_path = os.path.join(input_folder, filename)
            
            # Properly remove the .dcm extension
            base_name = os.path.splitext(filename)[0]  # Removes only the last extension
            png_path = os.path.join(output_folder, f"{base_name}.png")

            try:
                dicom_data = pydicom.dcmread(dicom_path)
                pixel_array = dicom_data.pixel_array.astype(np.float32)

                # Normalize to 0-255 range
                pixel_array -= pixel_array.min()
                pixel_array /= pixel_array.max()
                pixel_array *= 255.0
                pixel_array = pixel_array.astype(np.uint8)

                # Save as PNG
                Image.fromarray(pixel_array).save(png_path)

                print(f"Converted: {dicom_path} -> {png_path}")

            except Exception as e:
                print(f"Error processing {dicom_path}: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert DICOM MRI files to PNG format.")
    parser.add_argument("input_folder", type=str, help="Path to folder containing DICOM files")
    parser.add_argument("output_folder", type=str, help="Path to folder for output PNG files")
    
    args = parser.parse_args()
    
    dicom_to_png(args.input_folder, args.output_folder)
