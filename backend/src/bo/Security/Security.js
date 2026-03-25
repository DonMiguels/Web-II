import { Person } from "./Person/Person.js";
import { Profile } from "./Profile/Profile.js";
import { User } from "./User/User.js";
import { SecurityUser } from "./SecurityUser/SecurityUser.js";
import { SecurityProfile } from "./SecurityProfile/SecurityProfile.js";
import { SecuritySubsystem } from "./SecuritySubsystem/SecuritySubsystem.js";
import { SecurityClassEntity } from "./SecurityClassEntity/SecurityClassEntity.js";
import { SecurityMethodEntity } from "./SecurityMethodEntity/SecurityMethodEntity.js";
import { SecurityOption } from "./SecurityOption/SecurityOption.js";
import { SecurityMenu } from "./SecurityMenu/SecurityMenu.js";
import { SecurityTransaction } from "./SecurityTransaction/SecurityTransaction.js";
import { SecurityBridge } from "./SecurityBridge/SecurityBridge.js";

export class Security {
  constructor() {
    this.Person = Person;
    this.Profile = Profile;
    this.User = User;
    this.SecurityUser = SecurityUser;
    this.SecurityProfile = SecurityProfile;
    this.SecuritySubsystem = SecuritySubsystem;
    this.SecurityClassEntity = SecurityClassEntity;
    this.SecurityMethodEntity = SecurityMethodEntity;
    this.SecurityOption = SecurityOption;
    this.SecurityMenu = SecurityMenu;
    this.SecurityTransaction = SecurityTransaction;
    this.SecurityBridge = SecurityBridge;
  }
}
