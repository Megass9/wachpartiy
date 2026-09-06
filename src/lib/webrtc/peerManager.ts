/**
 * Mesh WebRTC PeerManager
 * Manages RTCPeerConnections for multi-user voice chat rooms.
 */

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export class PeerManager {
  private peers: Map<string, RTCPeerConnection> = new Map();
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private localStream: MediaStream | null = null;
  private onSignal: (toUserId: string, signalType: 'offer' | 'answer' | 'candidate', data: RTCSessionDescriptionInit | RTCIceCandidateInit) => void;
  private onRemoteTrack: (userId: string, stream: MediaStream) => void;
  private onPeerDisconnected: (userId: string) => void;

  constructor(
    onSignal: (toUserId: string, signalType: 'offer' | 'answer' | 'candidate', data: RTCSessionDescriptionInit | RTCIceCandidateInit) => void,
    onRemoteTrack: (userId: string, stream: MediaStream) => void,
    onPeerDisconnected: (userId: string) => void
  ) {
    this.onSignal = onSignal;
    this.onRemoteTrack = onRemoteTrack;
    this.onPeerDisconnected = onPeerDisconnected;
  }

  public setLocalStream(stream: MediaStream): void {
    this.localStream = stream;
    // Add local tracks to existing peer connections
    this.peers.forEach((peer) => {
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });
    });
  }

  public async initiateConnection(targetUserId: string): Promise<void> {
    const peer = this.createPeer(targetUserId);
    try {
      const offer = await peer.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });
      await peer.setLocalDescription(offer);
      this.onSignal(targetUserId, 'offer', offer);
    } catch (err) {
      console.error(`Failed to initiate connection to ${targetUserId}:`, err);
    }
  }

  public async handleOffer(fromUserId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.createPeer(fromUserId);
    try {
      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      this.onSignal(fromUserId, 'answer', answer);
    } catch (err) {
      console.error(`Failed to handle offer from ${fromUserId}:`, err);
    }
  }

  public async handleAnswer(fromUserId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peer = this.peers.get(fromUserId);
    if (!peer) return;
    try {
      if (peer.signalingState !== 'stable') {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (err) {
      console.error(`Failed to handle answer from ${fromUserId}:`, err);
    }
  }

  public async handleCandidate(fromUserId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peer = this.peers.get(fromUserId);
    if (!peer) return;
    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error(`Failed to handle candidate from ${fromUserId}:`, err);
    }
  }

  private createPeer(userId: string): RTCPeerConnection {
    if (this.peers.has(userId)) {
      this.closePeer(userId);
    }

    const peer = new RTCPeerConnection(RTC_CONFIG);
    this.peers.set(userId, peer);

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream) {
          peer.addTrack(track, this.localStream);
        }
      });
    }

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        this.onSignal(userId, 'candidate', event.candidate.toJSON());
      }
    };

    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        this.attachRemoteAudio(userId, remoteStream);
        this.onRemoteTrack(userId, remoteStream);
      }
    };

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed' || peer.connectionState === 'closed') {
        this.closePeer(userId);
        this.onPeerDisconnected(userId);
      }
    };

    return peer;
  }

  private attachRemoteAudio(userId: string, stream: MediaStream): void {
    let audio = this.audioElements.get(userId);
    if (!audio) {
      audio = new Audio();
      audio.autoplay = true;
      this.audioElements.set(userId, audio);
    }
    audio.srcObject = stream;
    audio.play().catch((e) => console.warn('Autoplay prevented on audio element:', e));
  }

  public closePeer(userId: string): void {
    const peer = this.peers.get(userId);
    if (peer) {
      peer.close();
      this.peers.delete(userId);
    }
    const audio = this.audioElements.get(userId);
    if (audio) {
      audio.pause();
      audio.srcObject = null;
      this.audioElements.delete(userId);
    }
  }

  public closeAll(): void {
    this.peers.forEach((peer, userId) => {
      this.closePeer(userId);
    });
    this.peers.clear();
    this.audioElements.clear();
    this.localStream = null;
  }
}
