const prisma = require('../lib/prisma');

// POST /api/messages/send — send message to a doctor or patient
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    if (!receiverId || !message?.trim()) {
      return res.status(400).json({ success: false, message: 'Receiver and message are required' });
    }

    const receiver = await prisma.user.findUnique({ where: { id: parseInt(receiverId) } });
    if (!receiver) return res.status(404).json({ success: false, message: 'Recipient not found' });

    const chatMsg = await prisma.chatMessage.create({
      data: {
        senderId: req.userId,
        receiverId: parseInt(receiverId),
        message: message.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
        receiver: { select: { id: true, name: true, role: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Message sent',
      chatMessage: {
        id: chatMsg.id,
        message: chatMsg.message,
        sender: chatMsg.sender,
        receiver: chatMsg.receiver,
        read: chatMsg.read,
        createdAt: chatMsg.createdAt,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

// GET /api/messages — get conversations for logged-in user
exports.getConversations = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all unique conversation partners
    const messages = await prisma.chatMessage.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { select: { id: true, name: true, role: true, email: true } },
        receiver: { select: { id: true, name: true, role: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const convMap = new Map();
    messages.forEach(msg => {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, {
          partner,
          lastMessage: msg.message,
          lastMessageAt: msg.createdAt,
          unread: 0,
          messages: [],
        });
      }
      convMap.get(partnerId).messages.push({
        id: msg.id,
        message: msg.message,
        senderId: msg.senderId,
        read: msg.read,
        createdAt: msg.createdAt,
        isMine: msg.senderId === userId,
      });
      if (msg.receiverId === userId && !msg.read) {
        convMap.get(partnerId).unread++;
      }
    });

    const conversations = Array.from(convMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    );

    res.json({ success: true, conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Failed to load conversations' });
  }
};

// GET /api/messages/:partnerId — get chat thread with specific user
exports.getChatThread = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const userId = req.userId;
    const pid = parseInt(partnerId);

    const partner = await prisma.user.findUnique({
      where: { id: pid },
      select: { id: true, name: true, role: true, email: true },
    });
    if (!partner) return res.status(404).json({ success: false, message: 'User not found' });

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: pid },
          { senderId: pid, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread messages as read
    await prisma.chatMessage.updateMany({
      where: { senderId: pid, receiverId: userId, read: false },
      data: { read: true },
    });

    const formatted = messages.map(m => ({
      id: m.id,
      message: m.message,
      isMine: m.senderId === userId,
      read: m.read,
      createdAt: m.createdAt,
    }));

    res.json({ success: true, partner, messages: formatted });
  } catch (error) {
    console.error('Get chat thread error:', error);
    res.status(500).json({ success: false, message: 'Failed to load chat' });
  }
};

// GET /api/messages/doctors/list — get available doctors for patients to message
exports.getAvailableDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      take: 20,
    });

    res.json({
      success: true,
      doctors: doctors.map(d => ({
        userId: d.user.id,
        name: d.user.name,
        specialization: d.specialization,
        experience: d.experience,
        city: d.city,
      })),
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ success: false, message: 'Failed to load doctors' });
  }
};
