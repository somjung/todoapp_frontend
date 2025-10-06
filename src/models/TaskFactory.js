// Base Task Class
export class BaseTask {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.completed = data.completed || false;
    this.type = data.type;
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  getDisplayInfo() {
    return {
      title: this.title,
      description: this.description,
      completed: this.completed,
      type: this.type
    };
  }
}

// Concrete Task Classes
export class StandardTask extends BaseTask {
  constructor(data) {
    super(data);
    this.type = 'STANDARD';
  }

  getDisplayInfo() {
    return {
      ...super.getDisplayInfo(),
      icon: '📝',
      color: 'blue'
    };
  }
}

export class DeadlineTask extends BaseTask {
  constructor(data) {
    super(data);
    this.type = 'DEADLINE';
    this.dueDate = data.dueDate;
  }

  getDisplayInfo() {
    const daysLeft = Math.ceil((new Date(this.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return {
      ...super.getDisplayInfo(),
      icon: '⏰',
      color: daysLeft < 3 ? 'red' : 'orange',
      dueDate: this.dueDate,
      daysLeft: daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'
    };
  }
}

export class SavingGoalTask extends BaseTask {
  constructor(data) {
    super(data);
    this.type = 'SAVING';
    this.targetAmount = data.targetAmount;
    this.currentAmount = data.currentAmount || 0;
  }

  getDisplayInfo() {
    const progress = (this.currentAmount / this.targetAmount) * 100;
    return {
      ...super.getDisplayInfo(),
      icon: '💰',
      color: 'green',
      targetAmount: this.targetAmount,
      currentAmount: this.currentAmount,
      progress: Math.min(progress, 100)
    };
  }
}

// Task Factory (Polymorphism implementation)
export class TaskFactory {
  static createTask(type, data) {
    switch (type?.toUpperCase()) {
      case 'STANDARD':
        return new StandardTask(data);
      case 'DEADLINE':
        return new DeadlineTask(data);
      case 'SAVING':
        return new SavingGoalTask(data);
      default:
        return new StandardTask(data);
    }
  }
}