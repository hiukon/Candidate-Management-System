// src/utils/uploadConcurrency.ts
export interface UploadTask {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'failed';
    error?: string;
    url?: string;
}

export class ConcurrentUploader {
    private maxConcurrent: number;
    private uploadQueue: UploadTask[] = [];
    private activeUploads: Map<number, Promise<void>> = new Map();
    private onProgress?: (task: UploadTask, index: number) => void;

    constructor(maxConcurrent: number = 3) {
        this.maxConcurrent = maxConcurrent;
    }

    async uploadFiles(
        files: File[],
        uploadFn: (file: File) => Promise<string>,
        onProgress?: (task: UploadTask, index: number) => void
    ): Promise<string[]> {
        this.onProgress = onProgress;
        this.uploadQueue = files.map((file, index) => ({
            file,
            progress: 0,
            status: 'pending'
        }));

        const results: string[] = new Array(files.length);
        const promises: Promise<void>[] = [];

        for (let i = 0; i < this.uploadQueue.length; i++) {
            const uploadPromise = this.uploadSingle(i, uploadFn, results);
            promises.push(uploadPromise);

            if (promises.length >= this.maxConcurrent) {
                await Promise.race(promises);
                // Remove completed promises
                for (let j = promises.length - 1; j >= 0; j--) {
                    const p = promises[j];
                    const isCompleted = await Promise.race([
                        p.then(() => true).catch(() => true),
                        new Promise(resolve => setTimeout(() => resolve(false), 0))
                    ]);
                    if (isCompleted) {
                        promises.splice(j, 1);
                    }
                }
            }
        }

        await Promise.all(promises);
        return results;
    }

    private async uploadSingle(
        index: number,
        uploadFn: (file: File) => Promise<string>,
        results: string[]
    ): Promise<void> {
        const task = this.uploadQueue[index];
        task.status = 'uploading';

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                if (task.progress < 90) {
                    task.progress += 10;
                    this.onProgress?.(task, index);
                }
            }, 100);

            const url = await uploadFn(task.file);
            clearInterval(progressInterval);

            task.progress = 100;
            task.status = 'completed';
            task.url = url;
            results[index] = url;
            this.onProgress?.(task, index);
        } catch (error) {
            task.status = 'failed';
            task.error = error instanceof Error ? error.message : 'Upload failed';
            this.onProgress?.(task, index);
            throw error;
        }
    }
}

// Helper function for parallel upload with concurrency control
export async function uploadMultipleFiles(
    files: File[],
    uploadFn: (file: File) => Promise<string>,
    maxConcurrent: number = 3
): Promise<string[]> {
    const uploader = new ConcurrentUploader(maxConcurrent);
    return uploader.uploadFiles(files, uploadFn);
}