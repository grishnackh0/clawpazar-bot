// ClawPazar – NanoClaw Swarm Manager
// Central orchestrator for all agent containers
// Manages agent lifecycle, task routing, and health monitoring

import { EventEmitter } from 'events';

// ============================================================
// TYPES
// ============================================================

export type AgentType = 'listing_creator' | 'negotiator' | 'auctioneer' | 'content_moderator' | 'notification' | 'price_analyzer';

export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface AgentConfig {
    name: string;
    type: AgentType;
    description: string;
    skills: string[];
    container: {
        image: string;
        memory: string;
        cpu: string;
        useGVisor: boolean;  // gVisor sandbox for security-critical agents
    };
    triggers: string[];
    maxConcurrent: number;
    timeoutMs: number;
}

export interface AgentTask {
    id: string;
    agentType: AgentType;
    taskType: string;
    priority: number;  // 1=highest, 10=lowest
    userId: string;
    listingId?: string;
    inputPayload: Record<string, unknown>;
    status: TaskStatus;
    result?: Record<string, unknown>;
    error?: string;
    queuedAt: Date;
    startedAt?: Date;
    completedAt?: Date;
}

interface AgentInstance {
    id: string;
    config: AgentConfig;
    status: 'idle' | 'busy' | 'starting' | 'stopping' | 'error';
    currentTask?: string;
    startedAt: Date;
    lastHealthCheck: Date;
    tasksCompleted: number;
    tasksFailed: number;
}

// ============================================================
// AGENT CONFIGS
// ============================================================

export const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
    listing_creator: {
        name: 'listing-creator',
        type: 'listing_creator',
        description: 'Sesli/yazılı mesajdan ilan oluşturur, fotoğraf optimize eder, kategori belirler',
        skills: ['voice-transcription', 'image-optimization', 'category-classification', 'description-generation'],
        container: {
            image: 'clawpazar/listing-creator:latest',
            memory: '512m',
            cpu: '0.5',
            useGVisor: false,
        },
        triggers: ['new-message', 'create-listing', 'update-listing'],
        maxConcurrent: 5,
        timeoutMs: 60_000,
    },

    negotiator: {
        name: 'negotiator',
        type: 'negotiator',
        description: 'Alıcı-satıcı arası otomatik pazarlık, fiyat stratejisi, karşı teklif üretimi',
        skills: ['price-analysis', 'counter-offer', 'deal-closing', 'market-comparison'],
        container: {
            image: 'clawpazar/negotiator:latest',
            memory: '256m',
            cpu: '0.25',
            useGVisor: false,
        },
        triggers: ['make-offer', 'counter-offer', 'accept-offer', 'reject-offer'],
        maxConcurrent: 10,
        timeoutMs: 30_000,
    },

    auctioneer: {
        name: 'auctioneer',
        type: 'auctioneer',
        description: 'Canlı mezat yönetimi: teklif doğrulama, zamanlayıcı, otomatik uzatma',
        skills: ['bid-validation', 'timer-management', 'winner-determination', 'anti-sniping'],
        container: {
            image: 'clawpazar/auctioneer:latest',
            memory: '256m',
            cpu: '0.25',
            useGVisor: false,
        },
        triggers: ['start-auction', 'place-bid', 'auction-timeout', 'end-auction'],
        maxConcurrent: 3,
        timeoutMs: 120_000,
    },

    content_moderator: {
        name: 'content-moderator',
        type: 'content_moderator',
        description: 'İçerik kontrolü, yasak ürün tespiti, AI watermark enjeksiyonu, KVKK doğrulama',
        skills: ['content-filter', 'watermark-injection', 'kvkk-validation', 'prohibited-item-detection'],
        container: {
            image: 'clawpazar/content-moderator:latest',
            memory: '512m',
            cpu: '0.5',
            useGVisor: true,  // SECURITY CRITICAL — runs in gVisor sandbox
        },
        triggers: ['moderate-content', 'apply-watermark', 'check-kvkk'],
        maxConcurrent: 3,
        timeoutMs: 45_000,
    },

    notification: {
        name: 'notification-agent',
        type: 'notification',
        description: 'Multi-kanal bildirim: WhatsApp, Telegram, Push, Email',
        skills: ['whatsapp-send', 'telegram-send', 'push-notification', 'email-send'],
        container: {
            image: 'clawpazar/notification:latest',
            memory: '128m',
            cpu: '0.1',
            useGVisor: false,
        },
        triggers: ['send-notification', 'broadcast'],
        maxConcurrent: 10,
        timeoutMs: 15_000,
    },

    price_analyzer: {
        name: 'price-analyzer',
        type: 'price_analyzer',
        description: 'Piyasa fiyat analizi, benzer ilan karşılaştırma, fiyat önerisi (IronClaw WASM)',
        skills: ['market-scan', 'price-prediction', 'similarity-search'],
        container: {
            image: 'clawpazar/price-analyzer:latest',
            memory: '512m',
            cpu: '1.0',
            useGVisor: true,  // runs CPU-intensive analysis in sandbox
        },
        triggers: ['analyze-price', 'compare-listings'],
        maxConcurrent: 3,
        timeoutMs: 30_000,
    },
};

// ============================================================
// SWARM MANAGER
// ============================================================

export class SwarmManager extends EventEmitter {
    private agents: Map<string, AgentInstance> = new Map();
    private taskQueue: AgentTask[] = [];
    private activeTasks: Map<string, AgentTask> = new Map();
    private isRunning = false;
    private pollInterval: ReturnType<typeof setInterval> | null = null;

    // ----------------------------------------------------------
    // LIFECYCLE
    // ----------------------------------------------------------

    /**
     * Start the swarm manager and begin processing tasks.
     */
    async start(): Promise<void> {
        if (this.isRunning) return;
        this.isRunning = true;

        console.log('[SwarmManager] Starting agent swarm...');

        // Spawn minimum agent pool
        for (const [type, config] of Object.entries(AGENT_CONFIGS)) {
            await this.spawnAgent(config);
            console.log(`[SwarmManager] Spawned agent: ${config.name}`);
        }

        // Start task processing loop
        this.pollInterval = setInterval(() => this.processQueue(), 500);

        // Start health check loop
        setInterval(() => this.healthCheck(), 30_000);

        this.emit('started');
        console.log('[SwarmManager] Swarm started with', this.agents.size, 'agents');
    }

    /**
     * Gracefully stop the swarm.
     */
    async stop(): Promise<void> {
        this.isRunning = false;
        if (this.pollInterval) clearInterval(this.pollInterval);

        // Wait for active tasks to complete (with timeout)
        const timeout = 30_000;
        const start = Date.now();
        while (this.activeTasks.size > 0 && Date.now() - start < timeout) {
            await new Promise((r) => setTimeout(r, 1000));
        }

        // Stop all agents
        for (const [id, agent] of this.agents) {
            await this.stopAgent(id);
        }

        this.emit('stopped');
        console.log('[SwarmManager] Swarm stopped');
    }

    // ----------------------------------------------------------
    // TASK SUBMISSION
    // ----------------------------------------------------------

    /**
     * Submit a task to the swarm.
     * Task is queued and assigned to the next available agent.
     */
    submitTask(task: Omit<AgentTask, 'id' | 'status' | 'queuedAt'>): string {
        const id = crypto.randomUUID();
        const fullTask: AgentTask = {
            ...task,
            id,
            status: 'queued',
            queuedAt: new Date(),
        };

        // Insert into priority queue (lower number = higher priority)
        const insertIdx = this.taskQueue.findIndex((t) => t.priority > fullTask.priority);
        if (insertIdx === -1) {
            this.taskQueue.push(fullTask);
        } else {
            this.taskQueue.splice(insertIdx, 0, fullTask);
        }

        this.emit('task:queued', fullTask);
        console.log(`[SwarmManager] Task queued: ${id} (${task.agentType}:${task.taskType})`);

        return id;
    }

    /**
     * Get task status.
     */
    getTaskStatus(taskId: string): AgentTask | undefined {
        return this.activeTasks.get(taskId) || this.taskQueue.find((t) => t.id === taskId);
    }

    // ----------------------------------------------------------
    // QUEUE PROCESSING
    // ----------------------------------------------------------

    private async processQueue(): Promise<void> {
        if (this.taskQueue.length === 0) return;

        for (let i = 0; i < this.taskQueue.length; i++) {
            const task = this.taskQueue[i];
            const agent = this.findAvailableAgent(task.agentType);

            if (agent) {
                // Remove from queue
                this.taskQueue.splice(i, 1);
                i--;

                // Execute
                await this.executeTask(agent, task);
            }
        }
    }

    private findAvailableAgent(type: AgentType): AgentInstance | undefined {
        for (const [, agent] of this.agents) {
            if (agent.config.type === type && agent.status === 'idle') {
                return agent;
            }
        }

        // Check if we can spawn more
        const config = AGENT_CONFIGS[type];
        const activeCount = Array.from(this.agents.values()).filter(
            (a) => a.config.type === type
        ).length;

        if (activeCount < config.maxConcurrent) {
            // Spawn new agent (async, will be available on next cycle)
            this.spawnAgent(config).catch(console.error);
        }

        return undefined;
    }

    private async executeTask(agent: AgentInstance, task: AgentTask): Promise<void> {
        agent.status = 'busy';
        agent.currentTask = task.id;
        task.status = 'running';
        task.startedAt = new Date();
        this.activeTasks.set(task.id, task);

        this.emit('task:started', task);

        try {
            // Execute agent logic with timeout
            const result = await Promise.race([
                this.runAgentLogic(agent.config, task),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Agent timeout')), agent.config.timeoutMs)
                ),
            ]);

            task.status = 'completed';
            task.result = result;
            task.completedAt = new Date();
            agent.tasksCompleted++;

            this.emit('task:completed', task);
        } catch (err) {
            task.status = 'failed';
            task.error = err instanceof Error ? err.message : String(err);
            task.completedAt = new Date();
            agent.tasksFailed++;

            this.emit('task:failed', task);
            console.error(`[SwarmManager] Task ${task.id} failed:`, task.error);
        } finally {
            agent.status = 'idle';
            agent.currentTask = undefined;
            this.activeTasks.delete(task.id);
        }
    }

    /**
     * Core agent execution logic.
     * Routes to the appropriate agent handler based on type and task.
     */
    private async runAgentLogic(
        config: AgentConfig,
        task: AgentTask
    ): Promise<Record<string, unknown>> {
        // In production, this dispatches to actual container processes.
        // For local dev, it calls the handler functions directly.

        switch (config.type) {
            case 'listing_creator':
                return this.handleListingCreation(task);
            case 'negotiator':
                return this.handleNegotiation(task);
            case 'auctioneer':
                return this.handleAuction(task);
            case 'content_moderator':
                return this.handleContentModeration(task);
            case 'notification':
                return this.handleNotification(task);
            case 'price_analyzer':
                return this.handlePriceAnalysis(task);
            default:
                throw new Error(`Unknown agent type: ${config.type}`);
        }
    }

    // ----------------------------------------------------------
    // AGENT HANDLERS
    // ----------------------------------------------------------

    private async handleListingCreation(task: AgentTask): Promise<Record<string, unknown>> {
        const { message, images, channel } = task.inputPayload as {
            message: string;
            images?: string[];
            channel: string;
        };

        // Step 1: Transcribe if voice message
        let text = message;
        if (task.inputPayload.isVoice) {
            // In production: call Whisper API or local transcription
            text = `[Transcribed] ${message}`;
        }

        // Step 2: Extract listing details using LLM
        const listingDraft = {
            title: this.extractTitle(text),
            description: text,
            price: this.extractPrice(text),
            category: this.classifyCategory(text),
            condition: 'used',
            content_source: 'ai_enhanced',
            source_channel: channel,
        };

        // Step 3: Auto-determine if high-value (>10k TL)
        const requiresReview = (listingDraft.price || 0) > 10000;

        return {
            listing: {
                ...listingDraft,
                status: requiresReview ? 'pending_review' : 'draft',
                requires_human_review: requiresReview,
            },
            images_processed: images?.length || 0,
            ai_fields: ['description', 'category', 'title'],
        };
    }

    private async handleNegotiation(task: AgentTask): Promise<Record<string, unknown>> {
        const { offerAmount, listingPrice, sellerMinPrice, round } = task.inputPayload as {
            offerAmount: number;
            listingPrice: number;
            sellerMinPrice: number;
            round: number;
        };

        // Strategy: Accept if offer >= sellerMinPrice, counter-offer otherwise
        if (offerAmount >= sellerMinPrice) {
            return {
                action: 'accept',
                agreedPrice: offerAmount,
                message: `Anlaşma! ${offerAmount} TL 🤝`,
            };
        }

        // Calculate counter-offer: midpoint between offer and listing price, trending toward seller
        const gap = listingPrice - offerAmount;
        const counterOffer = Math.round(offerAmount + gap * 0.6);

        if (round >= 5) {
            // Final round: take it or leave it at seller's min
            return {
                action: 'final_offer',
                counterOffer: sellerMinPrice,
                message: `Son teklifimiz: ${sellerMinPrice} TL. Kabul eder misiniz?`,
            };
        }

        return {
            action: 'counter_offer',
            counterOffer,
            message: `${counterOffer} TL olabilir mi? Piyasa ortalaması ${listingPrice} TL civarında.`,
            round: round + 1,
        };
    }

    private async handleAuction(task: AgentTask): Promise<Record<string, unknown>> {
        const { action, auctionId, bidAmount, bidderId } = task.inputPayload as {
            action: string;
            auctionId: string;
            bidAmount?: number;
            bidderId?: string;
        };

        switch (action) {
            case 'place_bid':
                return {
                    accepted: true,
                    bidId: crypto.randomUUID(),
                    currentPrice: bidAmount,
                    message: `Teklif kabul edildi: ${bidAmount} TL`,
                };
            case 'end_auction':
                return {
                    ended: true,
                    auctionId,
                    message: 'Mezat sona erdi!',
                };
            default:
                return { action, status: 'processed' };
        }
    }

    private async handleContentModeration(task: AgentTask): Promise<Record<string, unknown>> {
        const { content, contentType } = task.inputPayload as {
            content: string;
            contentType: string;
        };

        // In production: use content filtering model in IronClaw WASM sandbox
        const prohibited = this.checkProhibitedContent(content);

        return {
            approved: !prohibited.isProhibited,
            flags: prohibited.flags,
            watermark_applied: true,
            moderation_score: prohibited.isProhibited ? 0 : 1,
        };
    }

    private async handleNotification(task: AgentTask): Promise<Record<string, unknown>> {
        const { channel, recipientId, template, data } = task.inputPayload as {
            channel: string;
            recipientId: string;
            template: string;
            data: Record<string, string>;
        };

        // In production: route to WhatsApp/Telegram/Push APIs
        return {
            sent: true,
            channel,
            recipient: recipientId,
            template,
        };
    }

    private async handlePriceAnalysis(task: AgentTask): Promise<Record<string, unknown>> {
        const { title, category, condition } = task.inputPayload as {
            title: string;
            category: string;
            condition: string;
        };

        // In production: IronClaw WASM module for price analysis
        // Uses pgvector similarity search for comparable listings
        return {
            suggestedPrice: {
                min: 100,
                max: 500,
                avg: 300,
                confidence: 0.75,
            },
            similarListings: [],
            marketTrend: 'stable',
        };
    }

    // ----------------------------------------------------------
    // HELPER METHODS
    // ----------------------------------------------------------

    private extractTitle(text: string): string {
        // Simple heuristic: first meaningful phrase
        const words = text.split(/\s+/).slice(0, 8);
        return words.join(' ');
    }

    private extractPrice(text: string): number | null {
        const match = text.match(/(\d+[\.,]?\d*)\s*(tl|₺|lira)/i);
        return match ? parseFloat(match[1].replace(',', '.')) : null;
    }

    private classifyCategory(text: string): string {
        const keywords: Record<string, string[]> = {
            elektronik: ['telefon', 'laptop', 'tablet', 'kulaklık', 'samsung', 'iphone', 'bilgisayar'],
            moda: ['elbise', 'ayakkabı', 'çanta', 'giysi', 'mont', 'ceket'],
            'ev-yasam': ['masa', 'sandalye', 'mobilya', 'dekorasyon', 'mutfak'],
            aksesuar: ['saat', 'gözlük', 'takı', 'bileklik'],
            koleksiyon: ['antika', 'vintage', 'koleksiyon', 'nadir'],
        };

        const lower = text.toLowerCase();
        for (const [category, words] of Object.entries(keywords)) {
            if (words.some((w) => lower.includes(w))) return category;
        }
        return 'diger';
    }

    private checkProhibitedContent(content: string): {
        isProhibited: boolean;
        flags: string[];
    } {
        const prohibited = ['silah', 'uyuşturucu', 'sahte', 'kaçak', 'replika'];
        const lower = content.toLowerCase();
        const flags = prohibited.filter((word) => lower.includes(word));
        return { isProhibited: flags.length > 0, flags };
    }

    // ----------------------------------------------------------
    // AGENT LIFECYCLE
    // ----------------------------------------------------------

    private async spawnAgent(config: AgentConfig): Promise<void> {
        const id = `${config.name}-${crypto.randomUUID().substring(0, 8)}`;
        const agent: AgentInstance = {
            id,
            config,
            status: 'idle',
            startedAt: new Date(),
            lastHealthCheck: new Date(),
            tasksCompleted: 0,
            tasksFailed: 0,
        };
        this.agents.set(id, agent);
    }

    private async stopAgent(id: string): Promise<void> {
        const agent = this.agents.get(id);
        if (!agent) return;
        agent.status = 'stopping';
        // In production: stop the container
        this.agents.delete(id);
    }

    private async healthCheck(): Promise<void> {
        for (const [id, agent] of this.agents) {
            if (agent.status === 'error') {
                console.warn(`[SwarmManager] Agent ${id} in error state, restarting...`);
                await this.stopAgent(id);
                await this.spawnAgent(agent.config);
            }
            agent.lastHealthCheck = new Date();
        }
    }

    // ----------------------------------------------------------
    // STATUS
    // ----------------------------------------------------------

    getStatus(): {
        isRunning: boolean;
        agents: { type: string; status: string; tasks: number }[];
        queueLength: number;
        activeTasks: number;
    } {
        return {
            isRunning: this.isRunning,
            agents: Array.from(this.agents.values()).map((a) => ({
                type: a.config.type,
                status: a.status,
                tasks: a.tasksCompleted,
            })),
            queueLength: this.taskQueue.length,
            activeTasks: this.activeTasks.size,
        };
    }
}

// ============================================================
// FACTORY
// ============================================================

export function createSwarmManager(): SwarmManager {
    return new SwarmManager();
}
