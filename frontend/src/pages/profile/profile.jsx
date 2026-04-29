import "./profile.css";

const Profile = () => {

  return (
    <main className="profile-page">
      <header className="profile-header">
        <h1>Profile</h1>
      </header>

  

      <div className="profile-layout">
        <section className="profile-panel profile-details-panel">
          <h2>Details</h2>
          <form>
            <div className="profile-picture-row">
              <div className="profile-preview">
                <img src="" alt="Profile preview" />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="profile-name">Name</label>
              <input id="profile-name" name="name" type="text"
                placeholder="Enter name"/>
            </div>

            <div className="form-field">
              <label htmlFor="profile-email">Email</label>
              <input id="profile-email" name="email" type="email"
                placeholder="Enter email"/>
            </div>

            <button type="submit">Save Details</button>
          </form>
        </section>

        <section className="profile-panel">
          <h2>Change Password</h2>
          <form>
            <div className="form-field">
              <label htmlFor="current-password">Current password</label>
              <input id="current-password" name="currentPassword"
                type="password" placeholder="Current password"/>
            </div>

            <div className="form-field">
              <label htmlFor="new-password">New password</label>
              <input id="new-password" name="newPassword" type="password"
                placeholder="New password"/></div>

            <div className="form-field">
              <label htmlFor="confirm-password">Confirm password</label>
              <input id="confirm-password" name="confirmPassword"
                type="password" placeholder="Confirm password" /></div>

            <button type="submit">Change Password</button>
          </form>
        </section>
        <section className="profile-panel profile-logout-panel">
          <h2>Logout</h2>
          <p>End your current session on this device.</p>
          <button type="button">Logout</button>
        </section>
      </div>
    </main>
  );
};

export default Profile;
