const readline = require('readline');

// Command Interface
class Command {
  execute(rover) {
    throw new Error("Command not implemented");
  }
}

// Move Forward Command
class MoveCommand extends Command {
  execute(rover) {
    rover.move();
  }
}

// Turn Left Command
class TurnLeftCommand extends Command {
  execute(rover) {
    rover.turnLeft();
  }
}

// Turn Right Command
class TurnRightCommand extends Command {
  execute(rover) {
    rover.turnRight();
  }
}

// Rover Class
class Rover {
  constructor(x, y, direction, grid) {
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.grid = grid;
  }

  move() {
    this.direction.move(this); // Delegate movement based on direction
  }

  turnLeft() {
    this.direction = this.direction.left();
  }

  turnRight() {
    this.direction = this.direction.right();
  }

  getStatus() {
    return `Rover is at (${this.x}, ${this.y}) facing ${this.direction.name}.`;
  }
}

// Direction Classes (N, S, E, W)
class North {
  constructor() {
    this.name = "North";
  }

  move(rover) {
    if (!rover.grid.hasObstacle(rover.x, rover.y + 1)) {
      rover.y++;
    }
  }

  left() {
    return new West();
  }

  right() {
    return new East();
  }
}

class South {
  constructor() {
    this.name = "South";
  }

  move(rover) {
    if (!rover.grid.hasObstacle(rover.x, rover.y - 1)) {
      rover.y--;
    }
  }

  left() {
    return new East();
  }

  right() {
    return new West();
  }
}

class East {
  constructor() {
    this.name = "East";
  }

  move(rover) {
    if (!rover.grid.hasObstacle(rover.x + 1, rover.y)) {
      rover.x++;
    }
  }

  left() {
    return new North();
  }

  right() {
    return new South();
  }
}

class West {
  constructor() {
    this.name = "West";
  }

  move(rover) {
    if (!rover.grid.hasObstacle(rover.x - 1, rover.y)) {
      rover.x--;
    }
  }

  left() {
    return new South();
  }

  right() {
    return new North();
  }
}

// Grid Class with Obstacles
class Grid {
  constructor(width, height, obstacles = []) {
    this.width = width;
    this.height = height;
    this.obstacles = obstacles;
  }

  hasObstacle(x, y) {
    return this.obstacles.some(obstacle => obstacle[0] === x && obstacle[1] === y);
  }

  isWithinBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }
}

// Simulation Class
class MarsRoverSimulation {
  constructor(rover) {
    this.rover = rover;
    this.commands = [];
  }

  addCommand(command) {
    this.commands.push(command);
  }

  executeCommands() {
    this.commands.forEach(command => command.execute(this.rover));
  }

  getStatus() {
    return this.rover.getStatus();
  }
}

// Reading input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Parse obstacle input
const parseObstacles = (input) => {
  return input.split(';').map(pair => {
    const [x, y] = pair.split(',').map(Number);
    return [x, y];
  });
};

// Parse command input
const parseCommands = (input) => {
  return input.split('');
};

// Start the interactive session
rl.question('Enter grid size (width, height): ', (gridSizeInput) => {
  const [width, height] = gridSizeInput.split(',').map(Number);
  rl.question('Enter starting position (x, y, direction[N, S, E, W]): ', (startPosInput) => {
    const [x, y, directionInput] = startPosInput.split(',');
    const xPos = Number(x);
    const yPos = Number(y);
    let direction;

    // Initialize direction based on input
    switch (directionInput.toUpperCase()) {
      case 'N': direction = new North(); break;
      case 'S': direction = new South(); break;
      case 'E': direction = new East(); break;
      case 'W': direction = new West(); break;
      default: direction = new North(); // Defaulting to North
    }

    rl.question('Enter obstacles as x,y pairs separated by semicolons (e.g., 2,2;3,5): ', (obstaclesInput) => {
      const obstacles = parseObstacles(obstaclesInput);

      rl.question('Enter commands (M = Move, L = Left, R = Right): ', (commandsInput) => {
        const commandsArray = parseCommands(commandsInput);
        const grid = new Grid(width, height, obstacles);
        const rover = new Rover(xPos, yPos, direction, grid);

        const simulation = new MarsRoverSimulation(rover);

        // Add commands dynamically
        commandsArray.forEach(cmd => {
          switch (cmd.toUpperCase()) {
            case 'M': simulation.addCommand(new MoveCommand()); break;
            case 'L': simulation.addCommand(new TurnLeftCommand()); break;
            case 'R': simulation.addCommand(new TurnRightCommand()); break;
          }
        });

        simulation.executeCommands();
        console.log(simulation.getStatus());
        rl.close();
      });
    });
  });
});
