import boto3

client = boto3.client('ec2', region_name='ap-southeast-2')

response = client.run_instances(
    MaxCount=1,
    MinCount=1,
    ImageId="ami-09c56fed07bc3afe5",
    InstanceType="t3.micro",
    KeyName="diy-app",
    EbsOptimized=True,
    BlockDeviceMappings=[{"DeviceName": "/dev/xvda", "Ebs": {"Encrypted": True, "DeleteOnTermination": True, "Iops": 3000, "KmsKeyId": "25ebc499-7bc6-4ec8-aff2-0a8e225d769d", "SnapshotId": "snap-0cba775101a6f89f4", "VolumeSize": 8, "VolumeType": "gp3", "Throughput": 125}}],
    NetworkInterfaces=[{"SubnetId": "subnet-03b91532d94b46a20", "AssociatePublicIpAddress": True, "DeviceIndex": 0, "Groups": ["sg-02ad2f31f3c15b905"]}],
    CreditSpecification={"CpuCredits": "unlimited"},
    TagSpecifications=[{"ResourceType": "instance", "Tags": [{"Key": "Name", "Value": "diyshop-app-server"}]}],
    MetadataOptions={"HttpEndpoint": "enabled", "HttpPutResponseHopLimit": 2, "HttpTokens": "required"},
    PrivateDnsNameOptions={"HostnameType": "ip-name", "EnableResourceNameDnsARecord": False, "EnableResourceNameDnsAAAARecord": False}
)
