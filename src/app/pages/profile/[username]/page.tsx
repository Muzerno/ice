interface Props {
    params: { username: string };
  }
  
  export default function ProfilePage({ params }: Props) {
    const { username } = params;
  
    return (
      <div className="p-6">
        <h1>โปรไฟล์ของ {username}</h1>
      </div>
    );
  }
  