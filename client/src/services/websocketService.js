class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
    this.listeners = new Map();
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    // Skip WebSocket connection if no backend WebSocket support
    if (!token) {
      console.log('No token provided, skipping WebSocket connection');
      return;
    }

    const wsUrl = process.env.NODE_ENV === 'production' 
      ? 'wss://agriculture-app-1-u2a6.onrender.com/ws'
      : 'ws://localhost:5000/ws';

    try {
      this.socket = new WebSocket(`${wsUrl}?token=${token}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.emit('disconnected');
        
        if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect(token);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.scheduleReconnect(token);
    }
  }

  scheduleReconnect(token) {
    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`WebSocket reconnect scheduled in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (this.reconnectAttempts <= this.maxReconnectAttempts) {
        this.connect(token);
      } else {
        console.log('WebSocket max reconnection attempts reached, giving up');
      }
    }, delay);
  }

  handleMessage(data) {
    const { type, payload } = data;
    
    switch (type) {
      case 'notification':
        this.emit('notification', payload);
        break;
      case 'payment_status':
        this.emit('payment_status', payload);
        break;
      case 'consultation_update':
        this.emit('consultation_update', payload);
        break;
      case 'comment_update':
        this.emit('comment_update', payload);
        break;
      case 'follow_update':
        this.emit('follow_update', payload);
        break;
      default:
        console.log('Unknown message type:', type, payload);
    }
  }

  send(type, payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket event callback:', error);
        }
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnecting');
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.socket ? this.socket.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;