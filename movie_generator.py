import cv2
import os

# Path to the directory containing images
image_folder = 'images_mr_0/'
# Output video file name
video_name = 'output_video.mp4'
# Frame rate (frames per second)
fps = 30

# Get all image file names from the directory
images = [img for img in os.listdir(image_folder) if img.endswith(".jpg") or img.endswith(".png")]
# Sort images by name (optional, depending on your naming convention)
images.sort()

# Read the first image to get the width and height
first_image = cv2.imread(os.path.join(image_folder, images[0]))
height, width, layers = first_image.shape

# Create a VideoWriter object
fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec for MP4
video = cv2.VideoWriter(video_name, fourcc, fps, (width, height))

# Loop through all images and write them to the video
for image in images:
    img_path = os.path.join(image_folder, image)
    frame = cv2.imread(img_path)
    video.write(frame)  # Write the frame to the video

# Release the VideoWriter object
video.release()
cv2.destroyAllWindows()

print(f"Video {video_name} created successfully!")
